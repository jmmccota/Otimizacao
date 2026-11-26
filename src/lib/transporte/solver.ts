import type {
  Cell,
  TransporteMethod,
  TransporteProblem,
  TransporteReason,
  TransporteSnapshot,
  TransporteStep,
} from './types'

type Pos = { i: number; j: number }

interface State {
  cells: Cell[][]
  supply: number[]
  demand: number[]
}

const cloneState = (s: State): State => ({
  cells: s.cells.map((row) => row.map((c) => ({ ...c }))),
  supply: [...s.supply],
  demand: [...s.demand],
})

const totalCost = (s: State): number =>
  s.cells.reduce((acc, row) => acc + row.reduce((a, c) => a + c.cost * c.qty, 0), 0)

const finished = (s: State): boolean => s.supply.every((v) => v === 0) || s.demand.every((v) => v === 0)

/** Allocates as much as possible to cell (i, j). Mutates `s`. */
function allocate(s: State, { i, j }: Pos, reason: TransporteReason): TransporteStep {
  const sup = s.supply[i]
  const dem = s.demand[j]
  const amount = Math.min(sup, dem)
  s.cells[i][j].visited = true
  s.cells[i][j].qty = amount
  s.supply[i] = sup - amount
  s.demand[j] = dem - amount
  const exhausted = s.supply[i] === 0 && s.demand[j] === 0 ? 'both' : s.supply[i] === 0 ? 'row' : 'column'
  return { cell: { i, j }, reason, amount, supplyBefore: sup, demandBefore: dem, exhausted }
}

/** A cell choice together with the explanation that goes with it. */
interface Choice {
  pos: Pos
  reason: TransporteReason
}

/* ---------------------------- cell selection ---------------------------- */

/** Canto Noroeste. Needs the previous position, so it is created per solver. */
function northwest(): (s: State) => Choice {
  let current: Pos | undefined
  return (s) => {
    if (!current) current = { i: 0, j: 0 }
    else if (s.supply[current.i] === 0) current = { i: current.i + 1, j: current.j }
    else if (s.demand[current.j] === 0) current = { i: current.i, j: current.j + 1 }
    return { pos: current, reason: { kind: 'northwest' } }
  }
}

/** Menor Custo: cheapest unvisited cell whose row and column still have capacity. */
function minCost(s: State): Choice {
  let best: Pos | undefined
  let min = Number.NaN
  s.cells.forEach((row, i) =>
    row.forEach((c, j) => {
      if ((c.cost < min || Number.isNaN(min)) && !c.visited && s.supply[i] !== 0 && s.demand[j] !== 0) {
        min = c.cost
        best = { i, j }
      }
    }),
  )
  if (!best) throw new Error('No available cell')
  return { pos: best, reason: { kind: 'minCost', cost: min } }
}

interface Penalty {
  penalty: number
  idx: number
}

/** Penalty = (2nd smallest − smallest) cost among the still-open cells of a line. */
function linePenalty(costs: (number | undefined)[]): Penalty {
  let smallest: number | undefined
  let second: number | undefined
  let idx: number | undefined
  costs.forEach((c, k) => {
    if (c === undefined) return
    if (second === undefined || c < second) {
      if (smallest === undefined || c < smallest) {
        second = smallest
        smallest = c
        idx = k
      } else {
        second = c
      }
    }
  })
  return { penalty: second === undefined ? (smallest as number) : second - (smallest as number), idx: idx as number }
}

/** MAV — Vogel's Approximation Method. */
function vogel(s: State): Choice {
  const rows = s.cells.length
  const cols = s.cells[0].length
  const rowPen: Penalty[] = []
  const colPen: Penalty[] = []

  for (let i = 0; i < rows; i++) {
    if (s.supply[i] === 0) {
      rowPen.push({ penalty: -1, idx: 0 })
      continue
    }
    rowPen.push(
      linePenalty(s.cells[i].map((c, j) => (c.qty === 0 && s.demand[j] > 0 ? c.cost : undefined))),
    )
  }
  for (let j = 0; j < cols; j++) {
    if (s.demand[j] === 0) {
      colPen.push({ penalty: -1, idx: 0 })
      continue
    }
    colPen.push(
      linePenalty(s.cells.map((row, i) => (row[j].qty === 0 && s.supply[i] > 0 ? row[j].cost : undefined))),
    )
  }

  let iRow = 0
  let iCol = 0
  for (let k = 1; k < rowPen.length; k++) if (rowPen[iRow].penalty < rowPen[k].penalty) iRow = k
  for (let k = 1; k < colPen.length; k++) if (colPen[iCol].penalty < colPen[k].penalty) iCol = k

  const byRow = rowPen[iRow].penalty > colPen[iCol].penalty
  const pen = (p: Penalty) => (p.penalty === -1 ? null : p.penalty)
  return {
    pos: byRow ? { i: iRow, j: rowPen[iRow].idx } : { i: colPen[iCol].idx, j: iCol },
    reason: {
      kind: 'vogel',
      rowPenalties: rowPen.map(pen),
      colPenalties: colPen.map(pen),
      pick: byRow
        ? { type: 'row', index: iRow, penalty: rowPen[iRow].penalty }
        : { type: 'column', index: iCol, penalty: colPen[iCol].penalty },
    },
  }
}

/* -------------------------------- solver -------------------------------- */

/**
 * Step-by-step solver for the initial basic feasible solution of a
 * transportation problem. Every snapshot is immutable, so the UI can keep the
 * whole history (and "back" / "run all" use exactly the same code).
 */
export class TransporteSolver {
  readonly method: TransporteMethod
  readonly history: TransporteSnapshot[] = []
  private state: State
  private readonly pick: (s: State) => Choice

  constructor(problem: TransporteProblem, method: TransporteMethod) {
    this.method = method
    this.state = {
      cells: problem.costs.map((row) => row.map((cost) => ({ cost, qty: 0, visited: false }))),
      supply: [...problem.supply],
      demand: [...problem.demand],
    }
    this.pick = method === 'northwest' ? northwest() : method === 'minCost' ? minCost : vogel
    this.history.push(this.snapshot())
  }

  get done(): boolean {
    return finished(this.state)
  }

  get current(): TransporteSnapshot {
    return this.history[this.history.length - 1]
  }

  /** Lets the user pick the cell by hand (click on a table cell). */
  stepAt(pos: Pos, reason: TransporteReason = { kind: 'manual' }): TransporteSnapshot {
    const step = allocate(this.state, pos, reason)
    const snap = this.snapshot(pos, step)
    this.history.push(snap)
    return snap
  }

  step(): TransporteSnapshot {
    if (this.done) return this.current
    const { pos, reason } = this.pick(this.state)
    return this.stepAt(pos, reason)
  }

  run(): TransporteSnapshot[] {
    while (!this.done) this.step()
    return this.history
  }

  private snapshot(chosen?: Pos, step?: TransporteStep): TransporteSnapshot {
    const copy = cloneState(this.state)
    return { ...copy, totalCost: totalCost(copy), chosen: chosen && { ...chosen }, step }
  }
}

export const solveTransporte = (p: TransporteProblem, m: TransporteMethod): TransporteSnapshot[] =>
  new TransporteSolver(p, m).run()
