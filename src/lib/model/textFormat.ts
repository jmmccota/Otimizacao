import { parseBound } from '../simplex/build'
import type { Relation, SimplexModel } from '../simplex/types'

/**
 * The `.txt` model file shared with the original app:
 *
 *   Maximize
 *
 *   1|2|3|              ← objective
 *
 *   4|5|6|<=|7|         ← one line per constraint ("nr" when there are none)
 *   8|9|10|=|11|
 *
 *   0|0|0|              ← lower bounds
 *
 *   inf|inf|inf|        ← upper bounds
 */

export type ModelParseErrorCode =
  | 'empty'
  | 'goal'
  | 'objective'
  | 'constraint'
  | 'relation'
  | 'bounds'
  | 'number'

export class ModelParseError extends Error {
  readonly code: ModelParseErrorCode
  /** 1-based line number in the file, when known */
  readonly line?: number

  constructor(code: ModelParseErrorCode, line?: number) {
    super(`Invalid model file (${code}${line ? `, line ${line}` : ''})`)
    this.name = 'ModelParseError'
    this.code = code
    this.line = line
  }
}

const RELATIONS: readonly string[] = ['<=', '=', '>=']

const fields = (line: string): string[] =>
  line
    .split('|')
    .map((f) => f.trim())
    .filter((f, i, all) => f !== '' || i < all.length - 1)
    .filter((f) => f !== '')

function num(text: string, line: number): number {
  const v = Number(text.replace(',', '.'))
  if (text === '' || Number.isNaN(v)) throw new ModelParseError('number', line)
  return v
}

export function parseModelText(text: string): SimplexModel {
  const lines = text
    .split(/\r?\n/)
    .map((raw, i) => ({ raw: raw.trim(), no: i + 1 }))
    .filter((l) => l.raw !== '')
  if (lines.length === 0) throw new ModelParseError('empty')

  const goalWord = lines[0].raw.toLowerCase()
  if (goalWord !== 'maximize' && goalWord !== 'minimize') throw new ModelParseError('goal', lines[0].no)
  if (lines.length < 4) throw new ModelParseError('bounds')

  const obj = lines[1]
  const objective = fields(obj.raw).map((f) => num(f, obj.no))
  if (objective.length === 0) throw new ModelParseError('objective', obj.no)
  const n = objective.length

  const upperLine = lines[lines.length - 1]
  const lowerLine = lines[lines.length - 2]
  const body = lines.slice(2, -2).filter((l) => l.raw.toLowerCase() !== 'nr')

  const constraints = body.map((l) => {
    const f = fields(l.raw)
    if (f.length !== n + 2) throw new ModelParseError('constraint', l.no)
    const relation = f[n]
    if (!RELATIONS.includes(relation)) throw new ModelParseError('relation', l.no)
    return {
      coefs: f.slice(0, n).map((v) => num(v, l.no)),
      relation: relation as Relation,
      rhs: num(f[n + 1], l.no),
    }
  })

  const lower = fields(lowerLine.raw).map((f) => num(f, lowerLine.no))
  const upper = fields(upperLine.raw).map((f) => {
    const v = parseBound(f)
    if (Number.isNaN(v)) throw new ModelParseError('number', upperLine.no)
    return v
  })
  if (lower.length !== n || upper.length !== n) throw new ModelParseError('bounds', lowerLine.no)

  return { goal: goalWord === 'maximize' ? 'max' : 'min', objective, constraints, lower, upper }
}

export function serializeModelText(m: SimplexModel): string {
  const bar = (xs: (number | string)[]) => xs.map((x) => `${x}|`).join('')
  const out: string[] = [m.goal === 'max' ? 'Maximize' : 'Minimize', '', bar(m.objective), '']
  if (m.constraints.length === 0) out.push('nr')
  else for (const c of m.constraints) out.push(bar([...c.coefs, c.relation, c.rhs]))
  out.push('', bar(m.lower), '', bar(m.upper.map((u) => (u === Infinity ? 'inf' : u))), '')
  return out.join('\r\n')
}
