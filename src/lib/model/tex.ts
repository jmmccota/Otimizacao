import { formatNumber } from './numbers'
import type { Relation, SimplexModel } from '../simplex/types'

const REL: Record<Relation, string> = { '<=': '\\le', '=': '=', '>=': '\\ge' }

/** "3x_1 - x_2 + 5x_3" — zero terms are skipped, ±1 coefficients are implicit. */
export function linearTex(coefs: number[], label: (j: number) => string = (j) => `x_{${j + 1}}`, locale = 'en'): string {
  let out = ''
  coefs.forEach((c, j) => {
    if (c === 0) return
    const abs = Math.abs(c)
    const term = `${abs === 1 ? '' : formatNumber(abs, locale)}${label(j)}`
    out += out === '' ? (c < 0 ? `-${term}` : term) : c < 0 ? ` - ${term}` : ` + ${term}`
  })
  return out === '' ? '0' : out
}

/** The whole model as TeX lines (objective, constraints, bounds, domain). */
export function modelToTex(m: SimplexModel, opts: { integer?: boolean; locale?: string } = {}): string[] {
  const loc = opts.locale ?? 'en'
  const n = m.objective.length
  const lines = [`${m.goal === 'max' ? '\\max' : '\\min'}\\; z = ${linearTex(m.objective, undefined, loc)}`]
  for (const c of m.constraints) lines.push(`${linearTex(c.coefs, undefined, loc)} ${REL[c.relation]} ${formatNumber(c.rhs, loc)}`)
  for (let i = 0; i < n; i++) {
    const lo = m.lower[i]
    const hi = m.upper[i]
    const x = `x_{${i + 1}}`
    if (lo === hi) lines.push(`${x} = ${formatNumber(lo, loc)}`)
    else if (hi === Infinity) lines.push(`${x} \\ge ${formatNumber(lo, loc)}`)
    else lines.push(`${formatNumber(lo, loc)} \\le ${x} \\le ${formatNumber(hi, loc)}`)
  }
  if (opts.integer) lines.push(`${Array.from({ length: n }, (_, i) => `x_{${i + 1}}`).join(', ')} \\in \\mathbb{Z}`)
  return lines
}
