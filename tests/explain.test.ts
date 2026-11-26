import { describe, expect, it } from 'vitest'
import { SimplexSolver } from '../src/lib/simplex'
import { explainStep, labelTex } from '../src/lib/simplex/explain'
import { toModel } from './helpers'

const classic = toModel({
  problema: 'Maximize', objetivo: [3, 5],
  restricoes: [[1, 0], [0, 2], [3, 2]], relacoes: ['<=', '<=', '<='], rhs: [4, 12, 18],
  upper: ['inf', 'inf'], lower: [0, 0],
})

describe('explainStep', () => {
  it('labelTex', () => {
    expect(labelTex('x2')).toBe('x_{2}')
    expect(labelTex('a13')).toBe('a_{13}')
  })

  it('first iteration of the classic example: x2 enters (−5), s2 leaves (ratio 6), pivot 2', () => {
    const solver = new SimplexSolver(classic, 'bigM')
    solver.step()
    const e = explainStep(solver.history[0], 'en')!
    expect(e.lines.map((l) => l.key)).toEqual(['entersMostNegative', 'leaves', 'pivot'])
    expect(e.lines[0].params).toMatchObject({ value: '-5', col: '$x_{2}$' })
    expect(e.lines[1].params).toMatchObject({ ratio: '6', row: 2, leaving: '$s_{2}$' })
    expect(e.lines[2].params).toMatchObject({ value: '2', row: 2 })
    // row operations: normalise row 2, then eliminate x2 from row 3 (coefficient 2) and from z (−5)
    expect(e.operations[0]).toEqual({ key: 'normalize', params: { r: 2, p: '2' } })
    expect(e.operations.slice(1).map((o) => [o.key, o.params.i, o.params.m])).toEqual([
      ['eliminateZ', 0, '-5'],
      ['eliminate', 3, '2'],
    ])
  })

  it('operations are consistent with the next tableau (Gauss–Jordan check)', () => {
    const solver = new SimplexSolver(classic, 'bigM')
    solver.step()
    const [before, after] = solver.history
    const e = explainStep(before, 'en')!
    const p = before.pivot!
    if (p.kind !== 'pivot') throw new Error('expected a pivot')
    const pivotRow = before.tableau[p.row].map((v) => v / before.tableau[p.row][p.col])
    expect(after.tableau[p.row].map((v) => +v.toFixed(9))).toEqual(pivotRow.map((v) => +v.toFixed(9)))
    for (const op of e.operations.slice(1)) {
      const i = (op.params as { i: number }).i
      const m = before.tableau[i][p.col]
      const expected = before.tableau[i].map((v, j) => v - m * pivotRow[j])
      expect(after.tableau[i].map((v) => +v.toFixed(9))).toEqual(expected.map((v) => +v.toFixed(9)))
    }
  })

  it('minimisation: the z row is shown negated, so the MOST POSITIVE coefficient enters', () => {
    const m = toModel({
      problema: 'Minimize', objetivo: [-2, -3], restricoes: [[1, 1]], relacoes: ['<='], rhs: [4], upper: ['inf', 'inf'], lower: [0, 0],
    })
    const solver = new SimplexSolver(m, 'bigM')
    solver.step()
    expect(explainStep(solver.history[0], 'en')!.lines[0].key).toBe('entersMostPositive')
  })

  it('unbounded: explains why no row limits the growth, with no row operations', () => {
    const m = toModel({
      problema: 'Maximize', objetivo: [1, 1], restricoes: [[1, -1]], relacoes: ['<='], rhs: [1], upper: ['inf', 'inf'], lower: [0, 0],
    })
    const solver = new SimplexSolver(m, 'bigM')
    solver.run()
    const withUnbounded = solver.history.find((h) => h.pivot?.kind === 'unbounded')!
    const e = explainStep(withUnbounded, 'en')!
    expect(e.lines.map((l) => l.key)).toEqual(['entersMostNegative', 'unbounded'])
    expect(e.operations).toEqual([])
  })

  it('degenerate ties list the tied rows; the final tableau has nothing to explain', () => {
    const m = toModel({
      problema: 'Maximize', objetivo: [1, 1], restricoes: [[1, 0], [0, 1], [1, 1]], relacoes: ['<=', '<=', '<='], rhs: [2, 2, 4], upper: ['inf', 'inf'], lower: [0, 0],
    })
    const solver = new SimplexSolver(m, 'bigM')
    solver.run()
    const tie = solver.history.find((h) => h.pivot?.kind === 'degenerate')
    if (tie) expect(explainStep(tie, 'en')!.lines.some((l) => l.key === 'degenerate')).toBe(true)
    expect(explainStep(solver.history.at(-1)!, 'en')).toBeNull()
  })

  it('dual rule (generalized) cites the negative right-hand side', () => {
    const m = toModel({
      problema: 'Minimize', objetivo: [2, 3], restricoes: [[1, 1], [1, 3]], relacoes: ['>=', '>='], rhs: [4, 6], upper: ['inf', 'inf'], lower: [0, 0],
    })
    const solver = new SimplexSolver(m, 'generalized')
    expect(explainStep(solver.history[0], 'en')).toBeNull() // no pivot chosen yet
    solver.step()
    const first = explainStep(solver.history[0], 'en')!
    expect(first.lines[0].key).toBe('dual')
    expect(first.lines[0].params.rhs).toMatch(/^-/)
  })
})

import katex from 'katex'
import { objectiveRowTex, setupRowTex } from '../src/lib/simplex/explain'

describe('setup text', () => {
  it('writes the augmented equation of each row, valid TeX', () => {
    const m = toModel({
      problema: 'Minimize', objetivo: [2, 3], restricoes: [[1, 1], [1, 3], [2, -1]], relacoes: ['>=', '=', '<='], rhs: [4, 6, -1],
      upper: ['inf', '8'], lower: [0, 0],
    })
    const solver = new SimplexSolver(m, 'bigM')
    const tex = solver.setup.map((r) => setupRowTex(m, r, 'en'))
    expect(tex[0]).toEqual({ original: 'x_{1} + x_{2} \\ge 4', augmented: 'x_{1} + x_{2} - e_{1} + a_{1} = 4' })
    expect(tex[1].augmented).toBe('x_{1} + 3x_{2} + a_{2} = 6')
    // negative RHS: the row is multiplied by −1 (≤ becomes ≥) and gets surplus + artificial
    expect(solver.setup[2].transform).toBe('flipped')
    expect(tex[2].augmented).toBe('-2x_{1} + x_{2} - e_{3} + a_{3} = 1')
    // finite upper bound row
    expect(tex[3].original).toBe('x_{2} \\le 8')
    for (const t of tex) for (const s of [t.original, t.augmented]) expect(() => katex.renderToString(s, { throwOnError: true })).not.toThrow()
    expect(objectiveRowTex(m, 'en')).toBe('z - 2x_{1} - 3x_{2} = 0')
  })

  it('generalized shows negated / split rows', () => {
    const m = toModel({
      problema: 'Maximize', objetivo: [1], restricoes: [[1], [1]], relacoes: ['>=', '='], rhs: [2, 3], upper: ['inf'], lower: [0],
    })
    const solver = new SimplexSolver(m, 'generalized')
    expect(solver.setup.map((r) => r.transform)).toEqual(['negated', 'split-first', 'split-second'])
    expect(setupRowTex(m, solver.setup[0]).augmented).toBe('-x_{1} + s_{1} = -2')
  })
})
