import { describe, expect, it } from 'vitest'
import { solveWithGlpk, type LpModel } from './oracle'
import { METHODS, toModel } from './helpers'
import { solveSimplex } from '../src/lib/simplex'

/** Small deterministic PRNG so failures are reproducible. */
function rng(seed: number) {
  let s = seed >>> 0
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32)
}

function randomModel(seed: number): LpModel {
  const r = rng(seed)
  const int = (lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1))
  const n = int(2, 4)
  const m = int(1, 4)
  const rels = ['<=', '>=', '='] as const
  return {
    problema: r() < 0.5 ? 'Maximize' : 'Minimize',
    objetivo: Array.from({ length: n }, () => int(-5, 9)),
    restricoes: Array.from({ length: m }, () => Array.from({ length: n }, () => int(-3, 6))),
    relacoes: Array.from({ length: m }, () => rels[int(0, 2)]),
    rhs: Array.from({ length: m }, () => int(-4, 20)),
    // 50 %: finite upper bounds (bounded region), otherwise some models are unbounded
    upper: Array.from({ length: n }, () => (r() < 0.5 ? String(int(3, 12)) : 'inf')),
    lower: Array.from({ length: n }, () => (r() < 0.2 ? int(1, 2) : 0)),
  }
}

describe('simplex on 300 random models agrees with GLPK', () => {
  const failures: string[] = []
  it('status and objective value match for every method', async () => {
    for (let seed = 1; seed <= 1000; seed++) {
      const model = randomModel(seed)
      const oracle = await solveWithGlpk(model)
      for (const [label, method] of Object.entries(METHODS)) {
        const { result } = solveSimplex(toModel(model), method)
        const ok =
          result.status === oracle.status &&
          (oracle.status !== 'optimal' || Math.abs(result.z! - oracle.z) < 1e-5 * Math.max(1, Math.abs(oracle.z)))
        if (!ok)
          failures.push(
            `seed ${seed} ${label}: got ${result.status}/${result.z}, GLPK ${JSON.stringify(oracle)}`,
          )
      }
    }
    expect(failures.slice(0, 15)).toEqual([])
  })
})
