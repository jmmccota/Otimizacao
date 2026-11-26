export type Relation = '<=' | '=' | '>='
export type Goal = 'max' | 'min'
export type SimplexMethod = 'bigM' | 'twoPhase' | 'generalized'

export interface Constraint {
  coefs: number[]
  relation: Relation
  rhs: number
}

/** A linear program in the user's terms (before any augmentation). */
export interface SimplexModel {
  goal: Goal
  objective: number[]
  constraints: Constraint[]
  /** lower[i] <= x_i (default 0) */
  lower: number[]
  /** x_i <= upper[i] (Infinity = unbounded above) */
  upper: number[]
}

export type SimplexStatus = 'optimal' | 'unbounded' | 'infeasible' | 'iterationLimit'

/**
 * Why this pivot was chosen:
 *  - canonical: a basic variable still has a cost in row 0 (e.g. an artificial) → zero it first
 *  - dual: the right-hand side is negative → dual rule (generalized method)
 *  - primal: ordinary primal rule (most negative cost enters, minimum ratio leaves)
 *  - manual: the user clicked the cell
 */
export type PivotReason = 'canonical' | 'dual' | 'primal' | 'manual'

/** The pivot chosen for an iteration. */
export type Pivot =
  /** regular pivot */
  | { kind: 'pivot'; col: number; row: number; reason: PivotReason }
  /** tie in the ratio test: `rows` all tie, the first one leaves */
  | { kind: 'degenerate'; col: number; rows: number[]; reason: PivotReason }
  /** no row can leave: the objective grows without bound along `col` */
  | { kind: 'unbounded'; col: number }
  /** no valid entering column although the tableau is not optimal/feasible */
  | { kind: 'infeasible' }

/** How one row of the augmented model came to be (what the learner sees in "Setup"). */
export interface SetupRow {
  /** 1-based row number in the tableau */
  row: number
  source:
    | { type: 'constraint'; index: number }
    | { type: 'bound'; variable: number; kind: 'lower' | 'upper' }
  original: { relation: Relation; rhs: number }
  /** change applied before adding variables */
  transform: 'none' | 'flipped' | 'negated' | 'split-first' | 'split-second'
  /** relation after the transformation */
  relation: Relation
  /** labels of the variables added to this row, e.g. ['a2', 'e2'] */
  added: string[]
}

export interface SimplexResult {
  status: SimplexStatus
  degenerate: boolean
  /** objective value (null when there is no optimum) */
  z: number | null
  /** value of every tableau column (decision, slack, surplus, artificial) */
  variables: number[]
  basic: number[]
  nonBasic: number[]
}

/** Rows × columns; row 0 is the objective row, last column the right-hand side. */
export type Tableau = number[][]
