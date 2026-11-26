import { parseNumber, parseUpperBound } from './numbers'
import type { Relation, SimplexModel } from '../simplex/types'

/** What the editor keeps while the user types: raw strings, so "-" or "1," are allowed mid-edit. */
export interface EditorState {
  goal: 'max' | 'min'
  objective: string[]
  constraints: { coefs: string[]; relation: Relation; rhs: string }[]
  lower: string[]
  upper: string[]
}

export type EditorErrorCode = 'empty' | 'number' | 'bounds' | 'noVariables'
export interface EditorError {
  /** e.g. "objective.0", "constraint.2.coef.1", "constraint.2.rhs", "lower.1", "upper.1" */
  cell: string
  code: EditorErrorCode
}

export type EditorResult = { ok: true; model: SimplexModel } | { ok: false; errors: EditorError[] }

export const emptyEditor = (variables = 2, constraints = 1): EditorState => ({
  goal: 'max',
  objective: Array(variables).fill(''),
  constraints: Array.from({ length: constraints }, () => ({
    coefs: Array(variables).fill(''),
    relation: '<=' as Relation,
    rhs: '',
  })),
  lower: Array(variables).fill('0'),
  upper: Array(variables).fill('inf'),
})

export function setVariableCount(s: EditorState, n: number): EditorState {
  const fit = (xs: string[], fill: string) => (n <= xs.length ? xs.slice(0, n) : [...xs, ...Array(n - xs.length).fill(fill)])
  return {
    ...s,
    objective: fit(s.objective, ''),
    constraints: s.constraints.map((c) => ({ ...c, coefs: fit(c.coefs, '') })),
    lower: fit(s.lower, '0'),
    upper: fit(s.upper, 'inf'),
  }
}

export const addConstraint = (s: EditorState): EditorState => ({
  ...s,
  constraints: [...s.constraints, { coefs: Array(s.objective.length).fill(''), relation: '<=', rhs: '' }],
})

export const removeConstraint = (s: EditorState, index = s.constraints.length - 1): EditorState => ({
  ...s,
  constraints: s.constraints.filter((_, i) => i !== index),
})

const text = (n: number) => (n === Infinity ? 'inf' : String(n))

export const fromModel = (m: SimplexModel): EditorState => ({
  goal: m.goal,
  objective: m.objective.map(text),
  constraints: m.constraints.map((c) => ({ coefs: c.coefs.map(text), relation: c.relation, rhs: text(c.rhs) })),
  lower: m.lower.map(text),
  upper: m.upper.map(text),
})

/** Validates every cell and converts to the solver's model. */
export function toModel(s: EditorState): EditorResult {
  const errors: EditorError[] = []
  const num = (cell: string, v: string): number => {
    const n = parseNumber(v)
    if (n === null) errors.push({ cell, code: v.trim() === '' ? 'empty' : 'number' })
    return n ?? 0
  }
  if (s.objective.length === 0) return { ok: false, errors: [{ cell: 'objective', code: 'noVariables' }] }

  const objective = s.objective.map((v, i) => num(`objective.${i}`, v))
  const constraints = s.constraints.map((c, r) => ({
    coefs: c.coefs.map((v, j) => num(`constraint.${r}.coef.${j}`, v)),
    relation: c.relation,
    rhs: num(`constraint.${r}.rhs`, c.rhs),
  }))
  const lower = s.lower.map((v, i) => num(`lower.${i}`, v))
  const upper = s.upper.map((v, i) => {
    const n = parseUpperBound(v)
    if (n === null) errors.push({ cell: `upper.${i}`, code: v.trim() === '' ? 'empty' : 'number' })
    return n ?? Infinity
  })
  if (!errors.length)
    lower.forEach((lo, i) => {
      if (lo > upper[i]) errors.push({ cell: `lower.${i}`, code: 'bounds' })
    })

  return errors.length ? { ok: false, errors } : { ok: true, model: { goal: s.goal, objective, constraints, lower, upper } }
}

/** The browser can freeze on very large tableaus: warn above this many variables or constraints. */
export const LARGE_PROBLEM_THRESHOLD = 20
export const isLargeProblem = (variables: number, constraints: number): boolean =>
  variables > LARGE_PROBLEM_THRESHOLD || constraints > LARGE_PROBLEM_THRESHOLD
