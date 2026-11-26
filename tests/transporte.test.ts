import { describe, expect, it } from 'vitest'
import fixtures from './fixtures/transporte-models.json'
import golden from './golden/transporte.json'
import { solveTransporte, isBalanced, TransporteSolver, type TransporteMethod } from '../src/lib/transporte'

const METHODS: Record<string, TransporteMethod> = {
  'Canto Noroeste': 'northwest',
  'Menor Custo': 'minCost',
  MAV: 'vogel',
}

describe('transporte: parity with legacy goldens', () => {
  for (const g of golden) {
    it(`${g.model} / ${g.metodo}`, () => {
      const model = fixtures.find((f) => f.name === g.model)!
      const history = solveTransporte(model, METHODS[g.metodo])
      const legacy = g.output!

      expect(history).toHaveLength(legacy.iterations.length)
      history.forEach((snap, k) => {
        const table = legacy.iterations[k] as unknown as (
          | { custo: number; qtd: number; visitado: boolean }
          | number
        )[][]
        const n = snap.cells.length
        const m = snap.cells[0].length
        for (let i = 0; i < n; i++)
          for (let j = 0; j < m; j++) {
            const c = table[i][j] as { custo: number; qtd: number; visitado: boolean }
            expect(snap.cells[i][j]).toEqual({ cost: c.custo, qty: c.qtd, visited: c.visitado })
          }
        snap.supply.forEach((v, i) => expect(v).toBe(table[i][m]))
        snap.demand.forEach((v, j) => expect(v).toBe(table[n][j]))
      })
      expect(history.slice(1).map((s) => s.chosen)).toEqual(legacy.chosen)
      expect(history.at(-1)!.totalCost).toBe(legacy.cost)
    })
  }
})

describe('transporte: invariants', () => {
  for (const f of fixtures)
    for (const method of Object.values(METHODS))
      it(`${f.name} / ${method} allocates feasibly`, () => {
        const last = solveTransporte(f, method).at(-1)!
        const rowSums = last.cells.map((r) => r.reduce((a, c) => a + c.qty, 0))
        const colSums = f.demand.map((_, j) => last.cells.reduce((a, r) => a + r[j].qty, 0))
        rowSums.forEach((s, i) => expect(s).toBeLessThanOrEqual(f.supply[i]))
        colSums.forEach((s, j) => expect(s).toBeLessThanOrEqual(f.demand[j]))
        if (isBalanced(f)) {
          rowSums.forEach((s, i) => expect(s).toBe(f.supply[i]))
          colSums.forEach((s, j) => expect(s).toBe(f.demand[j]))
        }
      })

  it('snapshots are immutable across steps', () => {
    const h = solveTransporte(fixtures[0], 'northwest')
    expect(h[0].cells.flat().every((c) => c.qty === 0)).toBe(true)
  })
})

describe('transporte: step explanations (for the learner)', () => {
  const p = fixtures[0] // classic 3x4

  it('northwest: each step records the amount and what ran out', () => {
    const h = solveTransporte(p, 'northwest')
    const first = h[1].step!
    expect(first.reason).toEqual({ kind: 'northwest' })
    expect(first.cell).toEqual({ i: 0, j: 0 })
    expect(first.amount).toBe(Math.min(p.supply[0], p.demand[0]))
    expect(first.supplyBefore).toBe(p.supply[0])
    expect(first.demandBefore).toBe(p.demand[0])
    expect(['row', 'column', 'both']).toContain(first.exhausted)
    expect(h[0].step).toBeUndefined()
  })

  it('minCost: explains the cost that made the cell win', () => {
    const h = solveTransporte(p, 'minCost')
    const s = h[1].step!
    expect(s.reason.kind).toBe('minCost')
    if (s.reason.kind === 'minCost') expect(s.reason.cost).toBe(Math.min(...p.costs.flat()))
  })

  it('vogel: exposes every penalty and the one that was picked', () => {
    const h = solveTransporte(p, 'vogel')
    const s = h[1].step!
    expect(s.reason.kind).toBe('vogel')
    if (s.reason.kind === 'vogel') {
      expect(s.reason.rowPenalties).toHaveLength(p.supply.length)
      expect(s.reason.colPenalties).toHaveLength(p.demand.length)
      const all = [...s.reason.rowPenalties, ...s.reason.colPenalties].filter((v): v is number => v !== null)
      expect(s.reason.pick.penalty).toBe(Math.max(...all))
    }
  })

  it('manual steps are labelled as such', () => {
    const solver = new TransporteSolver(p, 'northwest')
    const snap = solver.stepAt({ i: 1, j: 1 })
    expect(snap.step!.reason).toEqual({ kind: 'manual' })
  })
})
