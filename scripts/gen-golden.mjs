// Records what the legacy solvers produce for every fixture.
// Usage: node scripts/gen-golden.mjs
import fs from 'node:fs'
import { loadLegacy } from '../tests/legacy/load.mjs'

const clone = (x) => JSON.parse(JSON.stringify(x))
const read = (f) => JSON.parse(fs.readFileSync(new URL(`../tests/fixtures/${f}`, import.meta.url), 'utf8'))

const simplexMethods = ['Grande M', 'Duas Fases', 'Generalizado']
const simplexGolden = []
for (const m of read('simplex-models.json')) {
  for (const metodo of simplexMethods) {
    const ctx = loadLegacy('simplex.js')
    ctx.model = { metodo, ...clone(m) }
    let entry = { model: m.name, metodo }
    try {
      const out = JSON.parse(
        // JSON turns Infinity/NaN into null; we encode them to keep information.
        ((ctx.__run = `
          var s = new Simplex(); s.init(model); var out = s.executa();
          var r = s.resultado(out.length - 1);
          JSON.stringify({ iterations: out, result: r }, function (k, v) {
            return (typeof v === 'number' && !isFinite(v)) ? { $num: String(v) } : v;
          })`),
        (await import('node:vm')).runInContext(ctx.__run, ctx)),
      )
      entry = { ...entry, ...out }
    } catch (e) {
      entry.error = String(e && e.message ? e.message : e)
    }
    simplexGolden.push(entry)
  }
}
fs.writeFileSync(new URL('../tests/golden/simplex.json', import.meta.url), JSON.stringify(simplexGolden, null, 1) + '\n')

const trMethods = ['Canto Noroeste', 'Menor Custo', 'MAV']
const trGolden = []
for (const m of read('transporte-models.json')) {
  for (const metodo of trMethods) {
    const ctx = loadLegacy('transporte.js')
    const rows = m.costs.map((r, i) => [...r, m.supply[i]])
    rows.push([...m.demand, 0])
    ctx.model = { metodo, problema: rows }
    let entry = { model: m.name, metodo }
    try {
      entry.output = JSON.parse(
        (await import('node:vm')).runInContext(
          `var t = new Transporte(); t.init(model); t.executa();
           JSON.stringify({ iterations: t.iteracoes, chosen: t.solver.escolhidos, cost: t.custo(t.iteracoes.length - 1) })`,
          ctx,
        ),
      )
    } catch (e) {
      entry.error = String(e && e.message ? e.message : e)
    }
    trGolden.push(entry)
  }
}
fs.writeFileSync(new URL('../tests/golden/transporte.json', import.meta.url), JSON.stringify(trGolden, null, 1) + '\n')
console.log('simplex entries:', simplexGolden.length, 'errors:', simplexGolden.filter((e) => e.error).length)
console.log('transporte entries:', trGolden.length, 'errors:', trGolden.filter((e) => e.error).length)
