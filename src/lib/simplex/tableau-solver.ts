import type { Pivot, SimplexStatus, Tableau } from './types'

const EPS = 1e-10

/**
 * Tabular simplex engine. Operates in place on a tableau where row 0 is the
 * objective row (optimal when every coefficient is ≥ 0) and the last column is
 * the right-hand side.
 *
 * Unlike the original implementation, the basis is tracked explicitly
 * (`basis[row]`) instead of being guessed from "unit columns". Guessing is
 * ambiguous — e.g. with a single constraint every slack column looks basic —
 * and made the original loop forever on unbounded models.
 */
export class TableauSolver {
  tableau: Tableau
  /** basis[r] = column that is basic in row r (basis[0] unused) */
  basis: number[]
  readonly generalized: boolean
  readonly iterationLimit: number

  finished = false
  iterations = 0
  unbounded = false
  infeasible = false
  hitLimit = false
  degenerate = false
  /** rows that tied in a ratio test and must end up with RHS = 0 */
  private tied: number[] = []

  constructor(
    tableau: Tableau,
    basis: number[],
    opts: { generalized?: boolean; iterationLimit?: number } = {},
  ) {
    this.tableau = tableau
    this.basis = basis
    this.generalized = opts.generalized ?? false
    this.iterationLimit = opts.iterationLimit ?? 70
  }

  /**
   * Objective-row noise tolerance, relative to its magnitude: Big-M puts values
   * around 1e5 in that row, so rounding errors there are far above 1e-10.
   */
  private get costTol(): number {
    return 1e-12 * Math.max(1, ...this.tableau[0].map((v) => Math.abs(v)))
  }

  private get rhsCol(): number {
    return this.tableau[0].length - 1
  }

  /** Basic columns whose objective-row coefficient is not zero (tableau not canonical yet). */
  private firstNonCanonical(): number {
    const cols = this.basis
      .slice(1)
      .filter((j) => this.tableau[0][j] !== 0)
      .sort((a, b) => a - b)
    return cols.length ? cols[0] : -1
  }

  /** True when the method has nothing left to do. */
  isFinished(): boolean {
    if (this.finished) return true
    const t = this.tableau
    const last = this.rhsCol
    const done =
      this.firstNonCanonical() === -1 &&
      t[0].slice(0, last).every((v) => !(v < -this.costTol)) &&
      t.slice(1).every((row) => !(row[last] < -1e-9))
    this.finished = done
    return done
  }

  status(): SimplexStatus {
    if (this.infeasible) return 'infeasible'
    if (this.unbounded) return 'unbounded'
    if (this.hitLimit) return 'iterationLimit'
    return 'optimal'
  }

  /** Chooses the entering column / leaving row following the original rules. */
  choosePivot(): Pivot {
    const t = this.tableau
    const last = this.rhsCol

    // Make the tableau canonical first: a basic variable must have a 0 cost.
    let entering = this.firstNonCanonical()
    if (entering !== -1)
      return { kind: 'pivot', col: entering, row: this.basis.indexOf(entering, 1), reason: 'canonical' }

    // Generalized (dual-simplex-like) rule: fix the most negative RHS first.
    if (this.generalized) {
      let min = 0
      let row = -1
      for (let i = 1; i < t.length; i++)
        if (t[i][last] < min) {
          row = i
          min = t[i][last]
        }
      if (row !== -1) {
        let ratio = 0
        entering = -1
        for (let j = 0; j < last; j++)
          if (t[row][j] < 0) {
            ratio = Math.abs(t[0][j] / t[row][j])
            entering = j
            break
          }
        if (entering === -1) return { kind: 'infeasible' }
        for (let j = entering; j < last; j++) {
          const r = Math.abs(t[0][j] / t[row][j])
          if (t[row][j] < 0 && r < ratio) {
            ratio = r
            entering = j
          }
        }
        return { kind: 'pivot', col: entering, row, reason: 'dual' }
      }
    }

    // Entering variable: most negative objective coefficient (first on ties).
    const tol = this.costTol
    for (let j = 0; j < last; j++)
      if (t[0][j] < -tol && (entering === -1 || t[0][j] < t[0][entering])) entering = j
    if (entering === -1) return { kind: 'infeasible' }

    // Leaving variable: minimum ratio test.
    let row = -1
    let rmin = Number.NaN
    let tie = Number.NaN
    for (let i = 1; i < t.length; i++) {
      if (t[i][entering] > 0) {
        const ri = t[i][last] / t[i][entering]
        if ((ri < rmin || Number.isNaN(rmin)) && ri >= 0) {
          rmin = ri
          row = i
        } else if (ri === rmin) {
          tie = rmin
        }
      }
    }
    if (Number.isNaN(rmin) || rmin < 0) return { kind: 'unbounded', col: entering }
    if (tie === rmin && rmin > 0) {
      const rows: number[] = []
      for (let i = 1; i < t.length; i++) if (rmin === t[i][last] / t[i][entering]) rows.push(i)
      return { kind: 'degenerate', col: entering, rows, reason: 'primal' }
    }
    return { kind: 'pivot', col: entering, row, reason: 'primal' }
  }

  /** Applies a pivot. Terminal pivots (unbounded / infeasible / limit) just flag the solver. */
  apply(p: Pivot): void {
    if (this.finished) return
    this.iterations++

    if (p.kind === 'infeasible') {
      this.infeasible = true
      this.finished = true
      return
    }
    if (p.kind === 'unbounded') {
      this.unbounded = true
      this.finished = true
      return
    }
    if (this.iterations === this.iterationLimit) {
      this.hitLimit = true
      this.finished = true
      return
    }

    let row: number
    let others: number[] = []
    if (p.kind === 'degenerate') {
      this.degenerate = true
      for (const r of p.rows) if (!this.tied.includes(r)) this.tied.push(r)
      row = p.rows[0]
      others = p.rows.slice(1)
    } else {
      row = p.row
    }
    this.pivotOn(row, p.col)

    // Degeneracy: rows that tied end with exactly 0 on the right-hand side.
    const k = this.tied.indexOf(row)
    if (k !== -1) {
      this.tied.splice(k, 1)
      for (const r of others) this.tableau[r][this.rhsCol] = 0
    }
    this.cleanFloatingPointNoise()
  }

  /** Gauss–Jordan pivot on (row, col). Also usable for manual pivots chosen in the UI. */
  pivotOn(row: number, col: number): void {
    const t = this.tableau
    const factor = 1 / t[row][col]
    if (factor !== 1) for (let j = 0; j < t[row].length; j++) t[row][j] *= factor
    for (let i = 0; i < t.length; i++) {
      if (i !== row && t[i][col] !== 0) {
        const f = t[i][col]
        for (let j = 0; j < t[i].length; j++) t[i][j] -= t[row][j] * f
      }
    }
    this.basis[row] = col
  }

  cleanFloatingPointNoise(): void {
    for (const row of this.tableau)
      for (let j = 0; j < row.length; j++) {
        const r = Math.round(row[j])
        if (row[j] < r + EPS && row[j] > r - EPS) row[j] = r
      }
  }
}
