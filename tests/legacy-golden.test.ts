import { describe, expect, it } from 'vitest'
import fixtures from './fixtures/simplex-models.json'
import golden from './golden/simplex.json'
import { solveWithGlpk, type LpModel } from './oracle'

/**
 * The goldens are what the ORIGINAL jQuery app computed. We compare them with
 * GLPK to learn which legacy results are trustworthy (to be kept as regression
 * targets) and which are bugs (to be fixed in the port, not preserved).
 *
 * KNOWN_LEGACY_BUGS is a ratchet: it documents today's wrong answers. The new
 * implementation (tests/simplex.test.ts) must NOT reproduce them.
 */
const KNOWN_LEGACY_BUGS = new Set([
  'unbounded|Grande M', //   reports "iteration limit" instead of "unbounded"
  'unbounded|Duas Fases',
  'unbounded|Generalizado',
  'infeasible|Grande M', //  reports an "optimal" z = -199997 (artificial var left in basis)
  'infeasible|Duas Fases', // reports "optimal" z = 1
  'infeasible|Generalizado', // says "unbounded. no solution" (wrong wording)
  'finite-upper-bound|Grande M', // right z, but status "iteration limit" (bound rows break termination)
  'finite-upper-bound|Duas Fases',
  'finite-upper-bound|Generalizado',
  'nonzero-lower-bound|Grande M', //   wrong z = 10 (correct: 5)
  'nonzero-lower-bound|Generalizado', // wrong z = 8  (correct: 5)
])

const revive = (v: unknown): number =>
  typeof v === 'object' && v !== null && '$num' in v ? Number((v as { $num: string }).$num) : (v as number)

describe('legacy goldens vs GLPK oracle', () => {
  for (const entry of golden) {
    const model = fixtures.find((f) => f.name === entry.model)!
    const key = `${entry.model}|${entry.metodo}`
    const isBug = KNOWN_LEGACY_BUGS.has(key)

    it(`${key} ${isBug ? '(known legacy bug)' : 'agrees with GLPK'}`, async () => {
      const oracle = await solveWithGlpk(model as unknown as LpModel)
      const type = entry.result!.TipoResultado as string
      const legacyZ = revive(entry.result!.FuncaoObjetivo)
      const says = {
        optimal: /Solução Ótima/.test(type),
        unbounded: /ilimitada/.test(type),
        infeasible: /inexistente|inviável/.test(type),
      }
      const correct =
        oracle.status === 'optimal'
          ? says.optimal && Math.abs(oracle.z - legacyZ) < 1e-6
          : oracle.status === 'unbounded'
            ? says.unbounded && !says.infeasible && !says.optimal
            : says.infeasible && !says.unbounded && !says.optimal

      expect(correct).toBe(!isBug)
    })
  }

  it('issue #12: legacy tableaus contain a string where a number is expected', () => {
    const bad = golden
      .filter((e) => e.model.startsWith('issue-12'))
      .flatMap((e) => e.iterations!.flat(2))
      .filter((c) => typeof c === 'string')
    // This is exactly what makes `cell.toFixed` throw in the old UI.
    expect(bad.length).toBeGreaterThan(0)
    expect(new Set(bad)).toEqual(new Set(['Inf']))
  })
})
