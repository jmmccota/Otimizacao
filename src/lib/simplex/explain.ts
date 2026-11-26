import { formatNumber } from '../model/numbers'
import type { SimplexSnapshot } from './solver'

/** "x12" → "x_{12}", "s3" → "s_{3}" */
export const labelTex = (label: string): string => `${label[0]}_{${label.slice(1)}}`
/** Same, wrapped in `$…$` so it can be dropped into a translated sentence. */
const inline = (label: string): string => `$${labelTex(label)}$`

export type ExplainKey =
  | 'canonical'
  | 'entersMostNegative'
  | 'entersMostPositive'
  | 'dual'
  | 'leaves'
  | 'pivot'
  | 'degenerate'
  | 'unbounded'
  | 'infeasible'
  | 'manual'

export interface ExplainLine {
  key: ExplainKey
  params: Record<string, string | number>
}

export type ExplainOp =
  | { key: 'normalize'; params: { r: number; p: string } }
  | { key: 'eliminate' | 'eliminateZ'; params: { i: number; r: number; m: string } }

export interface StepExplanation {
  lines: ExplainLine[]
  operations: ExplainOp[]
}

/**
 * Explains the iteration that LEAVES `snap` (the pivot recorded on it): which
 * variable enters and why, which one leaves, the pivot element and the row
 * operations applied. Everything is derived from the displayed tableau, so what
 * the learner reads matches the numbers on screen.
 */
export function explainStep(snap: SimplexSnapshot, locale = 'en'): StepExplanation | null {
  const p = snap.pivot
  if (!p) return null
  const t = snap.tableau
  const last = t[0].length - 1
  const fmt = (v: number) => formatNumber(v, locale)
  const col = (j: number) => inline(snap.labels[j])
  const lines: ExplainLine[] = []

  if (p.kind === 'infeasible') return { lines: [{ key: 'infeasible', params: {} }], operations: [] }

  const rows = p.kind === 'degenerate' ? p.rows : p.kind === 'pivot' ? [p.row] : []
  const reason = p.kind === 'unbounded' ? 'primal' : p.reason

  if (reason === 'canonical' && p.kind !== 'unbounded')
    lines.push({ key: 'canonical', params: { col: col(p.col), row: rows[0] } })
  else if (reason === 'dual' && p.kind !== 'unbounded')
    lines.push({ key: 'dual', params: { row: rows[0], rhs: fmt(t[rows[0]][last]), col: col(p.col) } })
  else if (reason === 'manual') lines.push({ key: 'manual', params: {} })
  else
    lines.push({
      key: snap.negated ? 'entersMostPositive' : 'entersMostNegative',
      params: { value: fmt(t[0][p.col]), col: col(p.col) },
    })

  if (p.kind === 'unbounded') {
    lines.push({ key: 'unbounded', params: { col: col(p.col) } })
    return { lines, operations: [] }
  }

  const row = rows[0]
  if (reason === 'primal' || reason === 'manual') {
    const ratio = t[row][last] / t[row][p.col]
    lines.push({
      key: 'leaves',
      params: { col: col(p.col), ratio: fmt(ratio), row, leaving: inline(snap.labels[snap.basis[row]] ?? '?0') },
    })
  }
  if (p.kind === 'degenerate') lines.push({ key: 'degenerate', params: { rows: rows.join(', ') } })
  lines.push({ key: 'pivot', params: { value: fmt(t[row][p.col]), row, col: col(p.col) } })

  const operations: ExplainOp[] = [{ key: 'normalize', params: { r: row, p: fmt(t[row][p.col]) } }]
  t.forEach((r, i) => {
    if (i !== row && r[p.col] !== 0)
      operations.push({ key: i === 0 ? 'eliminateZ' : 'eliminate', params: { i, r: row, m: fmt(r[p.col]) } })
  })
  return { lines, operations }
}

/* -------------------------------- setup text -------------------------------- */

import { linearTex } from '../model/tex'
import type { SetupRow, SimplexModel } from './types'

const REL_TEX = { '<=': '\\le', '=': '=', '>=': '\\ge' } as const

/** TeX of the original row and of the augmented equation that replaces it. */
export function setupRowTex(model: SimplexModel, row: SetupRow, locale = 'en'): { original: string; augmented: string } {
  const n = model.objective.length
  const fmt = (v: number) => formatNumber(v, locale)
  let coefs: number[]
  let rhs: number
  if (row.source.type === 'constraint') {
    const c = model.constraints[row.source.index]
    coefs = c.coefs
    rhs = c.rhs
  } else {
    coefs = Array.from({ length: n }, (_, j) => (j === (row.source as { variable: number }).variable ? 1 : 0))
    rhs = row.source.kind === 'lower' ? model.lower[row.source.variable] : model.upper[row.source.variable]
  }
  const original = `${linearTex(coefs, undefined, locale)} ${REL_TEX[row.original.relation]} ${fmt(rhs)}`

  const flip = row.transform === 'flipped' || row.transform === 'negated' || row.transform === 'split-second'
  const after = flip ? coefs.map((v) => -v) : coefs
  const rhsAfter = flip ? -rhs : rhs
  const extra = [...row.added]
    .sort((a, b) => Number(b[0] === 'e') - Number(a[0] === 'e')) // surplus first: … − e + a
    .map((label) => (label[0] === 'e' ? `- ${labelTex(label)}` : `+ ${labelTex(label)}`))
    .join(' ')
  return { original, augmented: `${linearTex(after, undefined, locale)} ${extra} = ${fmt(rhsAfter)}` }
}

/** The z row as the learner sees it: z − c₁x₁ − c₂x₂ … = 0 (same for max and min). */
export function objectiveRowTex(model: SimplexModel, locale = 'en'): string {
  const expr = linearTex(model.objective.map((c) => -c), undefined, locale)
  return `z ${expr.startsWith('-') ? `- ${expr.slice(1)}` : `+ ${expr}`} = 0`
}
