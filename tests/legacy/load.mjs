// Loads the ORIGINAL (pre-migration) solver code in a sandbox so that we can
// record its behaviour as golden data. Not used at runtime by the app.
import vm from 'node:vm'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = path.dirname(fileURLToPath(import.meta.url))

export function loadLegacy(file) {
  const ctx = vm.createContext({ console: { log() {} }, Math, Array, Number, isNaN, parseFloat })
  vm.runInContext(fs.readFileSync(path.join(dir, file), 'utf8'), ctx, { filename: file })
  return ctx
}
