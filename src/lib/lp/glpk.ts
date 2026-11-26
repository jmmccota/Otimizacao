import type { SimplexModel } from '../simplex/types'
import type { LpSolution, LpSolver } from './types'

/**
 * The slice of the glpk.js API we use. Both the browser build (async, runs in
 * its own Web Worker) and the Node build (sync) satisfy it, so this adapter
 * works in the app and in tests.
 */
export interface GlpkLike {
  GLP_MIN: number
  GLP_MAX: number
  GLP_LO: number
  GLP_UP: number
  GLP_DB: number
  GLP_FX: number
  GLP_MSG_OFF: number
  GLP_OPT: number
  GLP_NOFEAS: number
  GLP_INFEAS: number
  GLP_UNBND: number
  solve(lp: unknown, options?: unknown): unknown
}

type GlpkResult = { result: { status: number; z: number; vars: Record<string, number> } }

export function createGlpkSolver(glpk: GlpkLike): LpSolver {
  return {
    async solve(m: SimplexModel): Promise<LpSolution> {
      const name = (i: number) => `x${i + 1}`
      const lp = {
        name: 'lp',
        objective: {
          direction: m.goal === 'max' ? glpk.GLP_MAX : glpk.GLP_MIN,
          name: 'z',
          vars: m.objective.map((coef, i) => ({ name: name(i), coef })),
        },
        subjectTo: m.constraints.map((c, r) => ({
          name: `c${r}`,
          vars: c.coefs.map((coef, i) => ({ name: name(i), coef })),
          bnds: {
            type: c.relation === '<=' ? glpk.GLP_UP : c.relation === '>=' ? glpk.GLP_LO : glpk.GLP_FX,
            ub: c.rhs,
            lb: c.rhs,
          },
        })),
        bounds: m.lower.map((lb, i) => {
          const ub = m.upper[i]
          if (ub === Infinity) return { name: name(i), type: glpk.GLP_LO, lb, ub: 0 }
          return { name: name(i), type: lb === ub ? glpk.GLP_FX : glpk.GLP_DB, lb, ub }
        }),
      }
      // No presolve: with it GLPK can't tell "infeasible" from "unbounded".
      const { result } = (await glpk.solve(lp, { msglev: glpk.GLP_MSG_OFF, presol: false })) as GlpkResult
      if (result.status === glpk.GLP_OPT)
        return { status: 'optimal', z: result.z, x: m.objective.map((_, i) => result.vars[name(i)]) }
      if (result.status === glpk.GLP_UNBND) return { status: 'unbounded' }
      return { status: 'infeasible' }
    },
  }
}
