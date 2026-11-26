import { describe, expect, it } from 'vitest'
import {
  addConstraint, emptyEditor, formatNumber, fromModel, isLargeProblem, parseNumber, parseUpperBound,
  removeConstraint, setVariableCount, toModel,
  addDestination, addSource, emptyTransporte, fromProblem, imbalance, removeDestination, removeSource, toProblem,
} from '../src/lib/model'

describe('parseNumber', () => {
  it.each([
    ['3', 3], [' -2,5 ', -2.5], ['.5', 0.5], ['1/2', 0.5], ['-3/4', -0.75], ['1e3', 1000],
  ])('%j → %j', (t, v) => expect(parseNumber(t)).toBe(v))
  it.each(['', ' ', 'abc', '1..2', '1/0', '--1', '1,2,3'])('rejects %j', (t) => expect(parseNumber(t)).toBeNull())
  it('upper bound accepts inf in any case', () => {
    for (const t of ['inf', 'Inf', 'INF', '∞']) expect(parseUpperBound(t)).toBe(Infinity)
    expect(parseUpperBound('7')).toBe(7)
    expect(parseUpperBound('x')).toBeNull()
  })
})

describe('formatNumber', () => {
  it('uses the locale decimal separator and trims noise', () => {
    expect(formatNumber(1.5, 'pt')).toBe('1,5')
    expect(formatNumber(1.5, 'en')).toBe('1.5')
    expect(formatNumber(0.30000000000000004, 'en')).toBe('0.3')
    expect(formatNumber(1e-12, 'en')).toBe('0')
    expect(formatNumber(-1e-12, 'en')).toBe('0')
    expect(formatNumber(Infinity)).toBe('∞')
  })
})

describe('simplex editor state', () => {
  it('validates every cell and reports where', () => {
    const s = emptyEditor(2, 1)
    const r = toModel(s)
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.errors.map((e) => e.cell)).toEqual(
        expect.arrayContaining(['objective.0', 'objective.1', 'constraint.0.coef.0', 'constraint.0.rhs']),
      )
      expect(r.errors.every((e) => e.code === 'empty')).toBe(true)
    }
  })

  it('converts a filled editor to a model (issue #12 style bounds included)', () => {
    const s = emptyEditor(2, 1)
    s.objective = ['3', '5']
    s.constraints[0] = { coefs: ['1', '2'], relation: '>=', rhs: '1/2' }
    s.upper = ['inf', 'Inf']
    const r = toModel(s)
    expect(r.ok && r.model).toEqual({
      goal: 'max', objective: [3, 5],
      constraints: [{ coefs: [1, 2], relation: '>=', rhs: 0.5 }],
      lower: [0, 0], upper: [Infinity, Infinity],
    })
  })

  it('flags lower > upper and non-numbers', () => {
    const s = emptyEditor(1, 0)
    s.objective = ['1']
    s.lower = ['5']
    s.upper = ['2']
    const r = toModel(s)
    expect(!r.ok && r.errors).toEqual([{ cell: 'lower.0', code: 'bounds' }])
    s.upper = ['abc']
    const r2 = toModel(s)
    expect(!r2.ok && r2.errors).toEqual([{ cell: 'upper.0', code: 'number' }])
  })

  it('resizes variables / constraints without losing what was typed', () => {
    let s = emptyEditor(2, 1)
    s.objective = ['1', '2']
    s = setVariableCount(s, 3)
    expect(s.objective).toEqual(['1', '2', ''])
    expect(s.constraints[0].coefs).toHaveLength(3)
    expect(s.upper).toEqual(['inf', 'inf', 'inf'])
    s = setVariableCount(s, 1)
    expect(s.objective).toEqual(['1'])
    s = addConstraint(addConstraint(s))
    expect(s.constraints).toHaveLength(3)
    expect(removeConstraint(s).constraints).toHaveLength(2)
    expect(removeConstraint(s, 0).constraints).toHaveLength(2)
  })

  it('round-trips through fromModel', () => {
    const r = toModel({ ...emptyEditor(2, 1), objective: ['1', '2'], constraints: [{ coefs: ['3', '4'], relation: '=', rhs: '5' }] })
    expect(r.ok).toBe(true)
    if (r.ok) expect(toModel(fromModel(r.model))).toEqual(r)
  })

  it('has no hard limit but warns above 20', () => {
    expect(isLargeProblem(20, 20)).toBe(false)
    expect(isLargeProblem(21, 3)).toBe(true)
    expect(isLargeProblem(3, 21)).toBe(true)
    expect(setVariableCount(emptyEditor(2, 1), 40).objective).toHaveLength(40)
  })
})

describe('transporte editor state', () => {
  it('resizes and validates', () => {
    let s = emptyTransporte(2, 2)
    s = addSource(addDestination(s))
    expect(s.costs).toHaveLength(3)
    expect(s.costs[0]).toHaveLength(3)
    expect(removeDestination(removeSource(s)).costs).toHaveLength(2)
    expect(removeSource(emptyTransporte(1, 1)).costs).toHaveLength(1)
    const bad = toProblem(s)
    expect(bad.ok).toBe(false)
  })

  it('rejects negative supply / demand, accepts a full table', () => {
    const s = fromProblem({ costs: [[1, 2], [3, 4]], supply: [5, -1], demand: [2, 2] })
    const r = toProblem(s)
    expect(!r.ok && r.errors).toEqual([{ cell: 'supply.1', code: 'negative' }])
    const ok = toProblem(fromProblem({ costs: [[1, 2], [3, 4]], supply: [5, 3], demand: [4, 4] }))
    expect(ok.ok && imbalance(ok.problem)).toBe(0)
    const unbalanced = toProblem(fromProblem({ costs: [[1]], supply: [5], demand: [3] }))
    expect(unbalanced.ok && imbalance(unbalanced.problem)).toBe(2)
  })
})

import { linearTex, modelToTex } from '../src/lib/model'
import katex from 'katex'

describe('model → TeX', () => {
  it('skips zero terms and prints ±1 implicitly', () => {
    expect(linearTex([1, -1, 0, 5])).toBe('x_{1} - x_{2} + 5x_{4}')
    expect(linearTex([-2, 3])).toBe('-2x_{1} + 3x_{2}')
    expect(linearTex([0, 0])).toBe('0')
    expect(linearTex([1.5], undefined, 'pt')).toBe('1,5x_{1}')
  })
  it('produces valid TeX for the whole model', () => {
    const lines = modelToTex(
      { goal: 'min', objective: [2, -3], constraints: [{ coefs: [1, 1], relation: '>=', rhs: 4 }], lower: [0, 1], upper: [Infinity, 5] },
      { integer: true },
    )
    expect(lines[0]).toBe('\\min\\; z = 2x_{1} - 3x_{2}')
    expect(lines).toContain('x_{1} \\ge 0')
    expect(lines).toContain('1 \\le x_{2} \\le 5')
    for (const l of lines) expect(() => katex.renderToString(l, { throwOnError: true })).not.toThrow()
  })
})

import { parseTransporteText, serializeTransporteText, ModelParseError } from '../src/lib/model'

describe('transporte text format', () => {
  const classic = { costs: [[8, 6, 10, 9], [9, 12, 13, 7], [14, 9, 16, 5]], supply: [35, 50, 40], demand: [45, 20, 30, 30] }
  it('round-trips and accepts CRLF / trailing blank lines', () => {
    const text = serializeTransporteText(classic)
    expect(text.split('\r\n')[0]).toBe('8|6|10|9|35|')
    expect(parseTransporteText(text)).toEqual(classic)
    expect(parseTransporteText('1|2|3|\n4|5|6|\n\n7|8|\n')).toEqual({ costs: [[1, 2], [4, 5]], supply: [3, 6], demand: [7, 8] })
  })
  it('rejects ragged rows and non-numbers with the offending line', () => {
    expect(() => parseTransporteText('1|2|3|\n4|5|\n7|8|')).toThrowError(ModelParseError)
    try { parseTransporteText('1|x|3|\n7|8|') } catch (e) { expect((e as ModelParseError).code).toBe('number'); expect((e as ModelParseError).line).toBe(1) }
    try { parseTransporteText('') } catch (e) { expect((e as ModelParseError).code).toBe('empty') }
  })
})
