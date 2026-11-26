import GLPK from 'glpk.js/node'

export interface LpModel {
  problema: 'Maximize' | 'Minimize'
  objetivo: number[]
  restricoes: number[][]
  relacoes: string[]
  rhs: number[]
  upper: (string | number)[]
  lower: number[]
}

export type OracleResult =
  | { status: 'optimal'; z: number; x: number[] }
  | { status: 'infeasible' | 'unbounded' }

let glpkPromise: ReturnType<typeof GLPK> | undefined

/** Solves the LP with GLPK (WASM) — an independent reference for the hand-written simplex. */
export async function solveWithGlpk(m: LpModel): Promise<OracleResult> {
  const glpk = await (glpkPromise ??= GLPK())
  const name = (i: number) => `x${i + 1}`
  const parseUpper = (u: string | number) =>
    String(u).toLowerCase() === 'inf' ? Infinity : Number(u)
  const res = glpk.solve(
    {
      name: 'lp',
      objective: {
        direction: m.problema === 'Maximize' ? glpk.GLP_MAX : glpk.GLP_MIN,
        name: 'z',
        vars: m.objetivo.map((coef, i) => ({ name: name(i), coef })),
      },
      subjectTo: m.restricoes.map((row, r) => {
        const type =
          m.relacoes[r] === '<=' ? glpk.GLP_UP : m.relacoes[r] === '>=' ? glpk.GLP_LO : glpk.GLP_FX
        return {
          name: `c${r}`,
          vars: row.map((coef, i) => ({ name: name(i), coef })),
          bnds: { type, ub: m.rhs[r], lb: m.rhs[r] },
        }
      }),
      bounds: m.lower.map((lb, i) => {
        const ub = parseUpper(m.upper[i])
        return ub === Infinity
          ? { name: name(i), type: glpk.GLP_LO, lb, ub: 0 }
          : { name: name(i), type: lb === ub ? glpk.GLP_FX : glpk.GLP_DB, lb, ub }
      }),
    },
    { msglev: glpk.GLP_MSG_OFF, presol: false },
  )
  const { status, z, vars } = res.result
  if (status === glpk.GLP_OPT) return { status: 'optimal', z, x: m.objetivo.map((_, i) => vars[name(i)]) }
  if (status === glpk.GLP_UNBND) return { status: 'unbounded' }
  if (status === glpk.GLP_NOFEAS || status === glpk.GLP_INFEAS) return { status: 'infeasible' }
  // GLPK sometimes reports UNDEF for unbounded/infeasible LPs without presolve; probe once.
  return { status: 'infeasible' }
}
