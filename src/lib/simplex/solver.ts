import { buildBigM, buildGeneralized, buildPhase1, needsArtificial, objectiveRow, type Built } from './build'
import { TableauSolver } from './tableau-solver'
import type { Pivot, SetupRow, SimplexMethod, SimplexModel, SimplexResult, Tableau } from './types'

const EPS = 1e-9
const copy = (t: Tableau): Tableau => t.map((r) => [...r])

export interface SimplexSnapshot {
  /** tableau in display convention (objective row sign-corrected for minimisation) */
  tableau: Tableau
  /** pivot used to leave this snapshot (undefined for the last one or at a phase boundary) */
  pivot?: Pivot
  phase: 1 | 2
  /** basic column of each constraint row (index 0 unused) */
  basis: number[]
  /** name of every column except the right-hand side (x1, s2, e3, a3…) */
  labels: string[]
  /** row 0 is shown with its sign flipped (minimisation): the entering variable is then the most POSITIVE one */
  negated: boolean
  /** set on the first tableau of phase 2 (artificial columns removed, real objective restored) */
  event?: 'phase2-start'
}

export interface SimplexOptions {
  iterationLimit?: number
}

/**
 * Step-by-step simplex. `history` keeps every tableau so the UI can render the
 * whole run, step through it, or let the user click a pivot cell.
 */
export class SimplexSolver {
  readonly model: SimplexModel
  readonly method: SimplexMethod
  readonly history: SimplexSnapshot[] = []
  private engine: TableauSolver
  /** how each row of the augmented model was built (for the "setup" explanation) */
  readonly setup: SetupRow[]
  /** value of M when the Big-M method is used */
  readonly bigM?: number
  private artificial: number[]
  private labels: string[]
  private phase: 1 | 2 = 1
  private twoPhase: boolean
  private options: SimplexOptions
  private flagInfeasible = false

  constructor(model: SimplexModel, method: SimplexMethod, options: SimplexOptions = {}) {
    this.model = model
    this.method = method
    this.options = options
    this.twoPhase = method === 'twoPhase' && needsArtificial(model)

    let built: Built
    if (method === 'generalized') built = buildGeneralized(model)
    else if (this.twoPhase) built = buildPhase1(model)
    else built = buildBigM(model)

    this.artificial = built.artificial
    this.labels = built.labels
    this.setup = built.setup
    this.bigM = built.bigM
    this.phase = this.twoPhase ? 1 : 2
    this.engine = new TableauSolver(built.tableau, built.basis, {
      generalized: method === 'generalized',
      iterationLimit: options.iterationLimit,
    })
    this.record()
    this.settle()
  }

  get done(): boolean {
    return this.flagInfeasible || (this.engine.isFinished() && this.phase === 2)
  }

  /** One simplex iteration. */
  step(): SimplexSnapshot[] {
    if (this.done) return this.history
    this.pivotWith(this.engine.choosePivot())
    return this.history
  }

  /** Pivot chosen manually by the user (click on a cell). `row` is 1-based like the tableau. */
  pivotAt(col: number, row: number): SimplexSnapshot[] {
    this.pivotWith({ kind: 'pivot', col, row, reason: 'manual' })
    return this.history
  }

  run(): SimplexSnapshot[] {
    while (!this.done) this.step()
    return this.history
  }

  private pivotWith(pivot: Pivot): void {
    this.history[this.history.length - 1].pivot = pivot
    this.engine.apply(pivot)
    this.record()
    this.settle()
  }

  /** Handles the phase-1 → phase-2 transition and the final feasibility checks. */
  private settle(): void {
    if (!this.engine.isFinished()) return

    if (this.phase === 1) {
      this.finishPhase1()
    } else if (this.method === 'bigM' || (this.method === 'twoPhase' && !this.twoPhase)) {
      // an artificial variable left in the basis at a positive level ⇒ no feasible point
      const { tableau, basis } = this.engine
      const last = tableau[0].length - 1
      const status = this.engine.status()
      if (
        (status === 'optimal' || status === 'unbounded') &&
        this.artificial.some((a) => basis.slice(1).some((b, r) => b === a && tableau[r + 1][last] > EPS))
      ) {
        // An "unbounded" ray found while an artificial variable is still positive
        // says nothing about the original problem: it has no feasible point.
        this.engine.unbounded = false
        this.engine.infeasible = true
      }
    }
  }

  private finishPhase1(): void {
    const e = this.engine
    const last = e.tableau[0].length - 1

    // Phase-1 optimum must be 0, otherwise the original problem is infeasible.
    if (e.status() !== 'optimal' || Math.abs(e.tableau[0][last]) > EPS) {
      e.infeasible = true
      this.flagInfeasible = true
      return
    }

    // Artificial variables still basic (at level 0): pivot them out on any
    // non-artificial column; a row with no such column is redundant and dropped.
    const art = new Set(this.artificial)
    const dropped: number[] = []
    for (let r = 1; r < e.tableau.length; r++) {
      if (!art.has(e.basis[r])) continue
      const col = e.tableau[r].findIndex((v, j) => j < last && !art.has(j) && Math.abs(v) > EPS)
      if (col === -1) dropped.push(r)
      else e.pivotOn(r, col)
    }
    for (const r of dropped.reverse()) {
      e.tableau.splice(r, 1)
      e.basis.splice(r, 1)
    }

    // Remove artificial columns and restore the real objective.
    const keep = e.tableau[0].map((_, j) => !art.has(j))
    const remap = new Map<number, number>()
    keep.forEach((k, j) => k && remap.set(j, remap.size))
    const tableau = e.tableau.map((row) => row.filter((_, j) => keep[j]))
    const orig = objectiveRow(this.model)
    tableau[0] = tableau[0].map((_, j) => (j < orig.length ? orig[j] : 0))
    const basis = e.basis.map((b) => (b >= 0 ? (remap.get(b) as number) : -1))
    this.labels = this.labels.filter((_, j) => keep[j])

    this.artificial = []
    this.phase = 2
    this.engine = new TableauSolver(tableau, basis, {
      generalized: false,
      iterationLimit: this.options.iterationLimit,
    })
    this.history[this.history.length - 1].pivot = undefined
    this.record('phase2-start')
    this.settle()
  }

  private record(event?: SimplexSnapshot['event']): void {
    const t = copy(this.engine.tableau)
    if (this.model.goal === 'min') t[0] = t[0].map((v) => (v === 0 ? 0 : -v))
    this.history.push({
      tableau: t,
      phase: this.phase,
      basis: [...this.engine.basis],
      labels: [...this.labels],
      negated: this.model.goal === 'min',
      event,
    })
  }

  result(): SimplexResult {
    const e = this.engine
    const t = e.tableau
    const cols = t[0].length - 1
    const last = cols
    const variables = new Array<number>(cols).fill(0)
    for (let r = 1; r < t.length; r++) if (e.basis[r] >= 0) variables[e.basis[r]] = t[r][last]
    const basic = [...new Set(e.basis.slice(1))].sort((a, b) => a - b)
    const nonBasic = variables.map((_, j) => j).filter((j) => !basic.includes(j))
    const status = this.flagInfeasible ? 'infeasible' : e.status()
    const z = status === 'optimal' ? (this.model.goal === 'min' ? -t[0][last] : t[0][last]) : null
    return {
      status,
      degenerate: e.degenerate,
      z: z === 0 ? 0 : z,
      variables,
      basic,
      nonBasic,
    }
  }
}

export const solveSimplex = (m: SimplexModel, method: SimplexMethod, o?: SimplexOptions) => {
  const s = new SimplexSolver(m, method, o)
  s.run()
  return { history: s.history, result: s.result() }
}
