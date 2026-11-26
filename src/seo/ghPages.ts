import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { Plugin } from 'vite'
import { PUBLIC_PATHS } from './seo.ts'

/** Where each public route is written: "/" → index.html, "/simplex/about" → simplex/about/index.html */
export const pageFile = (path: string): string => (path === '/' ? 'index.html' : `${path.replace(/^\/|\/$/g, '')}/index.html`)

/** Folders and file types that belong to the paper / slides sources, never to the published site. */
const FORBIDDEN_DIRS = /^papers?$/i
const FORBIDDEN_FILES = /\.(tex|aux|bbl|blg|bib|bst|cls|sty|vrb|nav|snm|toc|synctex(\.gz)?)$/i

/** Lists everything in `dir` (recursively, as relative paths) that must not be published. */
export function findUnpublishable(dir: string, prefix = ''): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const rel = prefix ? `${prefix}/${e.name}` : e.name
    if (e.isDirectory()) return FORBIDDEN_DIRS.test(e.name) ? [`${rel}/`] : findUnpublishable(join(dir, e.name), rel)
    return FORBIDDEN_FILES.test(e.name) ? [rel] : []
  })
}

/**
 * Static hosting without rewrites (GitHub Pages): after the build, copy the app
 * shell to one real file per route, so a deep link such as /simplex/about/ is
 * answered with HTTP 200 and not by the 404 fallback; unknown URLs get the same
 * shell as 404.html and the app shows its "page not found" screen. Also writes the
 * custom-domain CNAME file when a site URL is known.
 */
export function staticPages(siteHost: string | undefined): Plugin {
  let outDir = 'dist'
  return {
    name: 'static-pages',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir
    },
    writeBundle(options) {
      const dir = options.dir ?? outDir
      const shell = join(dir, 'index.html')
      for (const path of PUBLIC_PATHS) {
        if (path === '/') continue
        const target = join(dir, pageFile(path))
        mkdirSync(dirname(target), { recursive: true })
        copyFileSync(shell, target)
      }
      copyFileSync(shell, join(dir, '404.html'))
      writeFileSync(join(dir, '.nojekyll'), '')
      const leaked = findUnpublishable(dir)
      if (leaked.length > 0) {
        throw new Error(
          `The paper/slides sources must not be published, but the build output contains: ${leaked.join(', ')}. ` +
            'Keep them outside public/ and src/.',
        )
      }
      if (siteHost) writeFileSync(join(dir, 'CNAME'), `${siteHost}\n`)
    },
  }
}
