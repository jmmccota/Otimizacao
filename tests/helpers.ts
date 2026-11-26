import type { SimplexMethod, SimplexModel } from '../src/lib/simplex'
import { parseBound } from '../src/lib/simplex'

interface LegacyShape {
  problema: string
  objetivo: number[]
  restricoes: number[][]
  relacoes: string[]
  rhs: number[]
  upper: (string | number)[]
  lower: number[]
}

/** Fixture (legacy field names) → typed model. */
export const toModel = (f: LegacyShape): SimplexModel => ({
  goal: f.problema === 'Maximize' ? 'max' : 'min',
  objective: f.objetivo,
  constraints: f.restricoes.map((coefs, i) => ({
    coefs,
    relation: f.relacoes[i] as '<=' | '=' | '>=',
    rhs: f.rhs[i],
  })),
  lower: f.lower,
  upper: f.upper.map(parseBound),
})

export const METHODS: Record<string, SimplexMethod> = {
  'Grande M': 'bigM',
  'Duas Fases': 'twoPhase',
  Generalizado: 'generalized',
}
