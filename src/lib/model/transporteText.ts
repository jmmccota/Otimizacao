import { ModelParseError } from './textFormat'
import { parseNumber } from './numbers'
import type { TransporteProblem } from '../transporte/types'

/**
 * Transportation file (same as the original app): one line per source with its
 * unit costs followed by its supply, then a last line with the demands.
 *
 *   8|6|10|9|35|
 *   9|12|13|7|50|
 *   45|20|30|30|
 */
export function parseTransporteText(text: string): TransporteProblem {
  const lines = text
    .split(/\r?\n/)
    .map((raw, i) => ({ raw: raw.trim(), no: i + 1 }))
    .filter((l) => l.raw !== '')
  if (lines.length < 2) throw new ModelParseError('empty')

  const rows = lines.map((l) =>
    l.raw
      .split('|')
      .map((f) => f.trim())
      .filter((f) => f !== '')
      .map((f) => {
        const v = parseNumber(f)
        if (v === null) throw new ModelParseError('number', l.no)
        return v
      }),
  )
  const demand = rows[rows.length - 1]
  const sources = rows.slice(0, -1)
  sources.forEach((r, i) => {
    if (r.length !== demand.length + 1) throw new ModelParseError('constraint', lines[i].no)
  })
  return { costs: sources.map((r) => r.slice(0, -1)), supply: sources.map((r) => r[r.length - 1]), demand }
}

export function serializeTransporteText(p: TransporteProblem): string {
  const bar = (xs: number[]) => xs.map((x) => `${x}|`).join('')
  return [...p.costs.map((r, i) => bar([...r, p.supply[i]])), bar(p.demand), ''].join('\r\n')
}
