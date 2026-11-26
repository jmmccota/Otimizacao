import { createGlpkSolver, type GlpkLike } from './glpk'
import type { LpSolver } from './types'

let cached: Promise<LpSolver> | undefined

/**
 * Loads GLPK on demand, entirely client-side. The glpk.js browser build embeds
 * its WASM and Web Worker inside its own JS chunk (the worker starts from a Blob
 * URL), so precaching that chunk in the service worker is enough for offline use.
 */
export function loadGlpkSolver(): Promise<LpSolver> {
  cached ??= import('glpk.js').then(async ({ default: GLPK }) =>
    createGlpkSolver((await GLPK()) as unknown as GlpkLike),
  )
  // let a failed load (e.g. offline before first visit) be retried
  cached.catch(() => (cached = undefined))
  return cached
}
