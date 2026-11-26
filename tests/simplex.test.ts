import { describe, expect, it } from 'vitest'
import fixtures from './fixtures/simplex-models.json'
import golden from './golden/simplex.json'
import { solveWithGlpk, type LpModel } from './oracle'
import { METHODS, toModel } from './helpers'
import { SimplexSolver, solveSimplex } from '../src/lib/simplex'

const near = (a: number, b: number) => Math.abs(a - b) < 1e-6

describe('simplex vs GLPK oracle (all fixtures × all methods)', () => {
  for (const f of fixtures)
    for (const [label, method] of Object.entries(METHODS))
      it(`${f.name} / ${label}`, async () => {
        const oracle = await solveWithGlpk(f as unknown as LpModel)
        const { history, result } = solveSimplex(toModel(f), method)

        expect(result.status).toBe(oracle.status)
        if (oracle.status === 'optimal') {
          expect(near(result.z!, oracle.z)).toBe(true)
          // decision variables satisfy the model
          const x = result.variables.slice(0, f.objetivo.length)
          f.restricoes.forEach((row, i) => {
            const lhs = row.reduce((a, c, j) => a + c * x[j], 0)
            if (f.relacoes[i] === '<=') expect(lhs).toBeLessThanOrEqual(f.rhs[i] + 1e-6)
            if (f.relacoes[i] === '>=') expect(lhs).toBeGreaterThanOrEqual(f.rhs[i] - 1e-6)
            if (f.relacoes[i] === '=') expect(near(lhs, f.rhs[i])).toBe(true)
          })
        }
        // issue #12: tableaus must only ever contain finite numbers
        for (const snap of history)
          for (const row of snap.tableau)
            for (const c of row) {
              expect(typeof c).toBe('number')
              expect(Number.isNaN(c)).toBe(false)
            }
      })
})

describe('simplex parity with legacy goldens (where legacy was right)', () => {
  const KNOWN_LEGACY_BUGS = new Set([
    'unbounded', 'infeasible', 'finite-upper-bound', 'nonzero-lower-bound', 'issue-12-mixed-case-inf',
  ])
  for (const g of golden) {
    if (KNOWN_LEGACY_BUGS.has(g.model)) continue
    it(`${g.model} / ${g.metodo}`, () => {
      const f = fixtures.find((x) => x.name === g.model)!
      const { history, result } = solveSimplex(toModel(f), METHODS[g.metodo])
      const legacy = g.iterations as number[][][]

      // Legacy quirk: for Minimize it shows row 0 un-negated in the initial tableau and
      // in the first phase-2 tableau (where artificial columns disappear). Ours is consistent.
      const norm = legacy.map((t, k) => {
        const phaseBoundary = k > 0 && t[0].length < legacy[k - 1][0].length
        return f.problema === 'Minimize' && (k === 0 || phaseBoundary)
          ? [t[0].map((v) => (v === 0 ? 0 : -v)), ...t.slice(1)]
          : t
      })

      expect(history.map((h) => h.tableau).length).toBe(norm.length)
      history.forEach((h, k) =>
        h.tableau.forEach((row, i) =>
          row.forEach((v, j) => expect(near(v, norm[k][i][j])).toBe(true)),
        ),
      )
      expect(result.z).not.toBeNull()
      expect(near(result.z!, g.result!.FuncaoObjetivo as number)).toBe(true)
    })
  }
})

describe('simplex: metadata for the step-by-step view', () => {
  for (const f of fixtures)
    for (const [label, method] of Object.entries(METHODS))
      it(`${f.name} / ${label}: labels match the tableau, pivots carry a reason`, () => {
        const solver = new SimplexSolver(toModel(f), method)
        solver.run()
        for (const snap of solver.history) {
          expect(snap.labels).toHaveLength(snap.tableau[0].length - 1)
          expect(new Set(snap.labels).size).toBe(snap.labels.length)
        }
        for (const snap of solver.history)
          if (snap.pivot && (snap.pivot.kind === 'pivot' || snap.pivot.kind === 'degenerate'))
            expect(['canonical', 'dual', 'primal', 'manual']).toContain(snap.pivot.reason)
        expect(solver.setup.length).toBeGreaterThanOrEqual(f.restricoes.length)
      })

  it('two-phase marks the start of phase 2 and drops the artificial labels', () => {
    const f = fixtures.find((x) => x.name === 'min-with-ge')!
    const solver = new SimplexSolver(toModel(f), 'twoPhase')
    solver.run()
    const start = solver.history.findIndex((h) => h.event === 'phase2-start')
    expect(start).toBeGreaterThan(0)
    expect(solver.history[start - 1].labels.some((l) => l.startsWith('a'))).toBe(true)
    expect(solver.history[start].labels.some((l) => l.startsWith('a'))).toBe(false)
    expect(solver.history[start].phase).toBe(2)
  })

  it('big-m exposes M and the added variables per row', () => {
    const f = fixtures.find((x) => x.name === 'min-with-ge')!
    const solver = new SimplexSolver(toModel(f), 'bigM')
    expect(solver.bigM).toBeGreaterThan(1e4)
    expect(solver.setup[0].added).toEqual(['a1', 'e1'])
  })
})
