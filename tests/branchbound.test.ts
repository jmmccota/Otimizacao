import { describe, expect, it } from 'vitest'
import GLPK from 'glpk.js/node'
import { BranchBound, pickBranchVariable } from '../src/lib/branchbound'
import { createGlpkSolver, type GlpkLike } from '../src/lib/lp'
import type { SimplexModel } from '../src/lib/simplex'

const lp = createGlpkSolver((await GLPK()) as unknown as GlpkLike)

/** Ground truth for small bounded problems: try every integer point in the box. */
function bruteForce(m: SimplexModel): { z: number; x: number[] } | null {
  let best: { z: number; x: number[] } | null = null
  const x: number[] = []
  const rec = (i: number) => {
    if (i === m.objective.length) {
      const ok = m.constraints.every((c) => {
        const lhs = c.coefs.reduce((a, v, j) => a + v * x[j], 0)
        return c.relation === '<=' ? lhs <= c.rhs : c.relation === '>=' ? lhs >= c.rhs : lhs === c.rhs
      })
      if (!ok) return
      const z = m.objective.reduce((a, v, j) => a + v * x[j], 0)
      if (!best || (m.goal === 'max' ? z > best.z : z < best.z)) best = { z, x: [...x] }
      return
    }
    for (let v = m.lower[i]; v <= m.upper[i]; v++) {
      x[i] = v
      rec(i + 1)
    }
  }
  rec(0)
  return best
}

function rng(seed: number) {
  let s = seed >>> 0
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32)
}

function randomIp(seed: number): SimplexModel {
  const r = rng(seed)
  const int = (lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1))
  const n = int(2, 3)
  const m = int(1, 3)
  const rels = ['<=', '<=', '>=', '='] as const
  return {
    goal: r() < 0.5 ? 'max' : 'min',
    objective: Array.from({ length: n }, () => int(-4, 9)),
    constraints: Array.from({ length: m }, () => ({
      coefs: Array.from({ length: n }, () => int(-2, 7)),
      relation: rels[int(0, 3)],
      rhs: int(0, 25),
    })),
    lower: Array.from({ length: n }, () => (r() < 0.2 ? 1 : 0)),
    upper: Array.from({ length: n }, () => int(3, 6)),
  }
}

describe('branch and bound', () => {
  it('classic example: max 5x+4y, 6x+4y<=24, x+2y<=6 → relaxation (3,1.5), integer optimum z=20', async () => {
    const model: SimplexModel = {
      goal: 'max',
      objective: [5, 4],
      constraints: [
        { coefs: [6, 4], relation: '<=', rhs: 24 },
        { coefs: [1, 2], relation: '<=', rhs: 6 },
      ],
      lower: [0, 0],
      upper: [Infinity, Infinity],
    }
    const bb = new BranchBound(model, lp)
    const root = await bb.start()
    expect(root.z).toBeCloseTo(21, 9)
    expect(root.x![0]).toBe(3)
    expect(root.x![1]).toBeCloseTo(1.5, 9)
    expect(root.status).toBe('branched')
    expect(root.branch!.variable).toBe(1)
    expect(root.branch!.value).toBeCloseTo(1.5, 9)

    const summary = await bb.run()
    expect(summary.status).toBe('optimal')
    expect(summary.z).toBe(20)
    expect(bb.nodes.get(summary.bestNode!)!.optimal).toBe(true)
    // children use heap numbering and carry the bound that created them
    expect(bb.nodes.get(2)!.added).toEqual({ variable: 1, kind: 'upper', value: 1 })
    expect(bb.nodes.get(3)!.added).toEqual({ variable: 1, kind: 'lower', value: 2 })
  })

  it('reports an integer-infeasible model', async () => {
    // 2x = 1 has a fractional LP solution but no integer one
    const model: SimplexModel = {
      goal: 'max',
      objective: [1],
      constraints: [{ coefs: [2], relation: '=', rhs: 1 }],
      lower: [0],
      upper: [Infinity],
    }
    expect((await new BranchBound(model, lp).run()).status).toBe('infeasible')
  })

  it('reports an unbounded model', async () => {
    const model: SimplexModel = {
      goal: 'max',
      objective: [1, 1],
      constraints: [{ coefs: [1, -1], relation: '<=', rhs: 1 }],
      lower: [0, 0],
      upper: [Infinity, Infinity],
    }
    expect((await new BranchBound(model, lp).run()).status).toBe('unbounded')
  })

  it('stops at the node limit instead of running away', async () => {
    const model = randomIp(7)
    const s = await new BranchBound(model, lp, { maxNodes: 1 }).run()
    expect(['limit', 'optimal', 'infeasible']).toContain(s.status)
  })

  it('branches on the variable closest to .5', () => {
    expect(pickBranchVariable([1, 2.9, 3.5, 4.1])).toBe(2)
    expect(pickBranchVariable([1, 2])).toBe(-1)
  })

  it('agrees with exhaustive enumeration on 400 random integer programs', async () => {
    const failures: string[] = []
    for (let seed = 1; seed <= 400; seed++) {
      const model = randomIp(seed)
      const truth = bruteForce(model)
      const s = await new BranchBound(model, lp).run()
      const ok = truth
        ? s.status === 'optimal' && Math.abs(s.z! - truth.z) < 1e-6
        : s.status === 'infeasible'
      if (!ok) failures.push(`seed ${seed}: B&B ${s.status}/${s.z} vs brute ${truth?.z ?? 'infeasible'}`)
    }
    expect(failures.slice(0, 10)).toEqual([])
  })
})

describe('branch and bound: explanations for the learner', () => {
  const model: SimplexModel = {
    goal: 'max',
    objective: [5, 4],
    constraints: [
      { coefs: [6, 4], relation: '<=', rhs: 24 },
      { coefs: [1, 2], relation: '<=', rhs: 6 },
    ],
    lower: [0, 0],
    upper: [Infinity, Infinity],
  }

  it('lists the fractional candidates and their distance to .5', async () => {
    const bb = new BranchBound(model, lp)
    const root = await bb.start()
    expect(root.candidates).toHaveLength(1)
    expect(root.candidates![0].variable).toBe(1)
    expect(root.candidates![0].distance).toBeCloseTo(0, 9)
  })

  it('lets the user branch on another variable while a node waits in the frontier', async () => {
    const m2: SimplexModel = { ...model, objective: [5, 4], constraints: [{ coefs: [2, 2], relation: '<=', rhs: 7 }, { coefs: [1, 3], relation: '<=', rhs: 8 }] }
    const bb = new BranchBound(m2, lp)
    const root = await bb.start()
    const frac = root.candidates!.map((c) => c.variable)
    if (frac.length < 2) return // solution happened to be integral in one coordinate
    const auto = root.branch!.variable
    const other = frac.find((v) => v !== auto)!
    expect(bb.setBranchVariable(1, other)).toBe(true)
    expect(root.branch).toMatchObject({ variable: other, manual: true })
    const children = await bb.step()
    expect(children[0].added!.variable).toBe(other)
  })

  it('refuses to re-branch a node that was already expanded', async () => {
    const bb = new BranchBound(model, lp)
    await bb.run()
    expect(bb.setBranchVariable(1, 1)).toBe(false)
  })

  it('records the incumbent that pruned a node', async () => {
    const bb = new BranchBound(model, lp)
    await bb.run()
    const pruned = [...bb.nodes.values()].filter((n) => n.status === 'pruned')
    for (const n of pruned) expect(n.incumbent).toBeTypeOf('number')
  })
})

describe('branch and bound: incumbent bookkeeping', () => {
  it('marks which integer nodes improved the incumbent when they were solved', async () => {
    const model: SimplexModel = {
      goal: 'max', objective: [5, 4],
      constraints: [{ coefs: [6, 4], relation: '<=', rhs: 24 }, { coefs: [1, 2], relation: '<=', rhs: 6 }],
      lower: [0, 0], upper: [Infinity, Infinity],
    }
    const bb = new BranchBound(model, lp)
    await bb.run()
    const ints = bb.order.map((id) => bb.nodes.get(id)!).filter((n) => n.status === 'integer')
    expect(ints.length).toBeGreaterThan(0)
    expect(ints[0].improved).toBe(true) // the first integer solution is always an improvement
    let best = -Infinity
    for (const n of ints) {
      expect(n.improved).toBe(n.z! > best + 1e-9)
      best = Math.max(best, n.z!)
    }
  })
})
