import type { SimplexModel } from '../simplex/types'

export type LpSolution =
  | { status: 'optimal'; z: number; x: number[] }
  | { status: 'infeasible' | 'unbounded' }

/**
 * Anything that can solve a continuous LP. Asynchronous so it can be backed by
 * a Web Worker (glpk.js in the browser) or a plain function in tests.
 */
export interface LpSolver {
  solve(model: SimplexModel): Promise<LpSolution>
}
