export type TransporteMethod = 'northwest' | 'minCost' | 'vogel'

export interface TransporteProblem {
  /** costs[i][j]: unit cost from source i to destination j */
  costs: number[][]
  supply: number[]
  demand: number[]
}

export interface Cell {
  cost: number
  /** quantity allocated to this route */
  qty: number
  visited: boolean
}

/** Why a cell was chosen — what the learner should be told at each step. */
export type TransporteReason =
  | { kind: 'northwest' }
  /** the cheapest still-open cell, with its unit cost */
  | { kind: 'minCost'; cost: number }
  /** Vogel: penalty of every open row / column (null = already closed) and the winner */
  | {
      kind: 'vogel'
      rowPenalties: (number | null)[]
      colPenalties: (number | null)[]
      pick: { type: 'row' | 'column'; index: number; penalty: number }
    }
  /** the user clicked the cell */
  | { kind: 'manual' }

/** What happened in one iteration. */
export interface TransporteStep {
  cell: { i: number; j: number }
  reason: TransporteReason
  /** min(supply, demand) */
  amount: number
  supplyBefore: number
  demandBefore: number
  /** which side ran out after the allocation */
  exhausted: 'row' | 'column' | 'both'
}

/** One immutable state of the allocation table. */
export interface TransporteSnapshot {
  cells: Cell[][]
  /** remaining supply per source */
  supply: number[]
  /** remaining demand per destination */
  demand: number[]
  /** Σ cost·qty for this snapshot */
  totalCost: number
  /** the cell chosen to reach this snapshot (undefined for the initial one) */
  chosen?: { i: number; j: number }
  /** explanation of the iteration that produced this snapshot (undefined for the initial one) */
  step?: TransporteStep
}

export const isBalanced = (p: TransporteProblem): boolean =>
  p.supply.reduce((a, b) => a + b, 0) === p.demand.reduce((a, b) => a + b, 0)
