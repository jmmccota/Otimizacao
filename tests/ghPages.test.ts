import { mkdirSync, mkdtempSync, readFileSync, existsSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { findUnpublishable, pageFile, staticPages } from '../src/seo/ghPages'
import { PUBLIC_PATHS } from '../src/seo/seo'

const dirs: string[] = []
const fakeBuild = (host: string | undefined) => {
  const dir = mkdtempSync(join(tmpdir(), 'pages-'))
  dirs.push(dir)
  writeFileSync(join(dir, 'index.html'), '<!doctype html><title>shell</title>')
  const plugin = staticPages(host)
  ;(plugin.writeBundle as (o: { dir: string }) => void).call({}, { dir })
  return dir
}
afterEach(() => dirs.splice(0).forEach((d) => rmSync(d, { recursive: true, force: true })))

describe('static pages for GitHub Pages', () => {
  it('maps every route to a real folder/index.html', () => {
    expect(pageFile('/')).toBe('index.html')
    expect(pageFile('/simplex')).toBe('simplex/index.html')
    expect(pageFile('/branch-and-bound/about')).toBe('branch-and-bound/about/index.html')
  })

  it('writes the app shell for every public route, a 404.html, .nojekyll and the CNAME', () => {
    const dir = fakeBuild('otimizacao.js.org')
    for (const p of PUBLIC_PATHS) expect(readFileSync(join(dir, pageFile(p)), 'utf8')).toBe('<!doctype html><title>shell</title>')
    expect(readFileSync(join(dir, '404.html'), 'utf8')).toContain('shell')
    expect(existsSync(join(dir, '.nojekyll'))).toBe(true)
    expect(readFileSync(join(dir, 'CNAME'), 'utf8')).toBe('otimizacao.js.org\n')
  })

  it('does not write a CNAME when the host is unknown (e.g. a project page or a local build)', () => {
    const dir = fakeBuild(undefined)
    expect(readdirSync(dir)).not.toContain('CNAME')
    expect(readdirSync(dir)).toContain('404.html')
  })
})

describe('the paper and slides never get published', () => {
  const build = (extra: (dir: string) => void) => {
    const dir = mkdtempSync(join(tmpdir(), 'pages-'))
    dirs.push(dir)
    writeFileSync(join(dir, 'index.html'), '<!doctype html>')
    extra(dir)
    return () => (staticPages('otimizacao.js.org').writeBundle as (o: { dir: string }) => void).call({}, { dir })
  }

  it('a normal build output is clean', () => {
    expect(build(() => {})).not.toThrow()
  })

  it.each([['papers'], ['paper'], ['Papers']])('fails the build if a "%s" folder ends up in the output', (name) => {
    const run = build((dir) => {
      mkdirSync(join(dir, name, 'SBPO - LaTeX'), { recursive: true })
      writeFileSync(join(dir, name, 'SBPO - LaTeX', 'a.txt'), 'x')
    })
    expect(run).toThrowError(new RegExp(`${name}/`))
  })

  it('fails on LaTeX sources and build files even outside a papers folder', () => {
    const run = build((dir) => {
      mkdirSync(join(dir, 'assets'))
      for (const f of ['main.tex', 'main.aux', 'refs.bib', 'slides.synctex.gz', 'slides.vrb']) writeFileSync(join(dir, 'assets', f), 'x')
    })
    expect(run).toThrowError(/main\.tex.*|assets\/main\.tex/)
    const dir = [...dirs].at(-1)!
    expect(findUnpublishable(dir).sort()).toEqual(['assets/main.aux', 'assets/main.tex', 'assets/refs.bib', 'assets/slides.synctex.gz', 'assets/slides.vrb'])
  })

  it('does not flag the legitimate site files', () => {
    const dir = mkdtempSync(join(tmpdir(), 'pages-'))
    dirs.push(dir)
    mkdirSync(join(dir, 'assets'))
    for (const f of ['index-abc.js', 'app.css', 'KaTeX_Main.woff2', 'lp-model.png', 'sw.js', 'sitemap.xml']) writeFileSync(join(dir, 'assets', f), 'x')
    expect(findUnpublishable(dir)).toEqual([])
  })

  it('the real public/ and src/ folders contain none of it', () => {
    const root = join(__dirname, '..')
    expect(findUnpublishable(join(root, 'public'))).toEqual([])
    expect(findUnpublishable(join(root, 'src'))).toEqual([])
  })
})
