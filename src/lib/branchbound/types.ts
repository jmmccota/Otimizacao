import type { SimplexModel } from '../simplex/types'

export type NodeStatus =
  /** LP relaxation not solved yet (waiting in the frontier) */
  | 'pending'
  /** LP relaxation has no feasible point */
  | 'infeasible'
  /** all variables are integer: a candidate solution */
  | 'integer'
  /** fractional solution that was split into two children */
  | 'branched'
  /** fractional solution whose bound cannot beat the incumbent */
  | 'pruned'

export interface BBNode {
  /** heap numbering: root = 1, children of k are 2k and 2k+1 */
  id: number
  parent: number | null
  depth: number
  /** the integer program of this node (original model with tightened bounds) */
  model: SimplexModel
  status: NodeStatus
  /** LP relaxation value (undefined while pending / infeasible) */
  z?: number
  x?: number[]
  /** every fractional variable with its distance to .5 (the "most fractional" rule picks the smallest) */
  candidates?: { variable: number; value: number; distance: number }[]
  /** variable this node was split on, with the value it had */
  branch?: { variable: number; value: number; /** true when the user overrode the automatic choice */ manual?: boolean }
  /** integer nodes: did this one become the new best solution at the time it was solved? */
  improved?: boolean
  /** incumbent z that made this node `pruned` */
  incumbent?: number
  /** the bound added to reach this node from its parent */
  added?: { variable: number; kind: 'upper' | 'lower'; value: number }
  /** true for the node holding the final optimal integer solution */
  optimal: boolean
}

/** `limit`: stopped at the node limit (the incumbent, if any, is not proven optimal) */
export type BBStatus = 'running' | 'optimal' | 'infeasible' | 'unbounded' | 'limit'

export interface BBSummary {
  status: BBStatus
  z: number | null
  x: number[] | null
  /** id of the node with the best integer solution */
  bestNode: number | null
  nodes: number
}
