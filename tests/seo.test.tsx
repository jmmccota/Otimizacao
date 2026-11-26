// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryHistory } from '@tanstack/react-router'
import { createAppRouter } from '../src/router'
import i18n from '../src/i18n'
import { PUBLIC_PATHS, normalizeSiteUrl, robotsTxt, sitemapXml, slashAddress } from '../src/seo/seo'
import { setHead } from '../src/seo/head'
import { seoFiles } from '../src/seo/vitePlugin'

beforeAll(() => {
  Element.prototype.scrollIntoView = () => {}
  window.scrollTo = () => {}
})
beforeEach(async () => {
  await i18n.changeLanguage('en')
})
afterEach(cleanup)

const description = () => document.head.querySelector('meta[name="description"]')?.getAttribute('content')
async function open(path: string) {
  const router = createAppRouter({ history: createMemoryHistory({ initialEntries: [path] }) })
  render(<RouterProvider router={router} />)
  await screen.findByRole('banner')
  return { user: userEvent.setup(), router }
}

describe('sitemap & robots', () => {
  it('lists every public route of the app, and only those', () => {
    const router = createAppRouter()
    const routes = Object.keys(router.routesByPath).map((p) => (p.length > 1 ? p.replace(/\/+$/, '') : p))
    expect([...new Set(routes)].sort()).toEqual([...PUBLIC_PATHS].sort())
  })

  it('writes a valid sitemap with absolute URLs', () => {
    const xml = sitemapXml('https://example.org', '2026-11-26')
    expect(xml).toContain('<loc>https://example.org/</loc>')
    expect(xml).toContain('<loc>https://example.org/simplex/about/</loc>')
    expect(xml.match(/<url>/g)).toHaveLength(PUBLIC_PATHS.length)
    expect(xml).toContain('<lastmod>2026-11-26</lastmod>')
    expect(sitemapXml('https://a.b/?x=1&y=2', '2026-01-01', ['/p'])).toContain('https://a.b/?x=1&amp;y=2/p/')
  })

  it('normalizes the site URL and refuses anything that is not http(s)', () => {
    expect(normalizeSiteUrl(' https://example.org/// ')).toBe('https://example.org')
    expect(normalizeSiteUrl('http://localhost:4173')).toBe('http://localhost:4173')
    for (const bad of [undefined, '', 'example.org', 'ftp://x.y', 'javascript:alert(1)']) expect(normalizeSiteUrl(bad)).toBeUndefined()
  })

  it('robots.txt allows crawling and points to the sitemap only when the URL is known', () => {
    expect(robotsTxt()).toBe('User-agent: *\nAllow: /\n')
    expect(robotsTxt('https://example.org')).toContain('Sitemap: https://example.org/sitemap.xml')
  })

  it('the build plugin emits robots.txt always, sitemap.xml only with a URL', () => {
    const run = (url?: string) => {
      const emitted: string[] = []
      const warnings: string[] = []
      const plugin = seoFiles(url)
      const ctx = { emitFile: (f: { fileName: string }) => void emitted.push(f.fileName), warn: (m: string) => void warnings.push(m) }
      ;(plugin.generateBundle as () => void).call(ctx)
      return { emitted, warnings }
    }
    expect(run('https://example.org')).toEqual({ emitted: ['robots.txt', 'sitemap.xml'], warnings: [] })
    const without = run(undefined)
    expect(without.emitted).toEqual(['robots.txt'])
    expect(without.warnings[0]).toMatch(/VITE_SITE_URL/)
  })
})

describe('meta description & canonical', () => {
  it('setHead creates the tags once and then updates them', () => {
    setHead('first', '/a', 'https://example.org')
    setHead('second', '/simplex/', 'https://example.org')
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1)
    expect(description()).toBe('second')
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://example.org/simplex/')
    setHead('home', '/', 'https://example.org')
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://example.org/')
  })

  it.each([
    ['/', /Free online tool to learn Optimization/],
    ['/simplex', /Solve linear programming problems with the Simplex/],
    ['/simplex/about', /Understand the Simplex method/],
    ['/transporte', /Solve transportation problems/],
    ['/branch-and-bound/about', /Understand Branch and Bound/],
    ['/privacy', /Privacy policy: what the site stores/],
    ['/contact', /Get in touch/],
  ])('%s has its own description', async (path, re) => {
    await open(path)
    await waitFor(() => expect(description()).toMatch(re))
  })

  it('the description follows the language and the inner tab', async () => {
    const { user } = await open('/simplex')
    await waitFor(() => expect(description()).toMatch(/Solve linear programming problems/))
    await user.click(screen.getByRole('tab', { name: 'About the model' }))
    await waitFor(() => expect(description()).toMatch(/Understand the Simplex method/))
    await i18n.changeLanguage('es')
    await waitFor(() => expect(description()).toMatch(/Comprende el método Simplex/))
  })
})

describe('privacy and contact pages', () => {
  it('privacy policy covers local processing, storage, analytics, ads and choices', async () => {
    await open('/privacy')
    expect(screen.getByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeTruthy()
    for (const h of ['Your problems stay in your browser', 'Browser storage', 'Google Analytics', 'Advertising', 'Your choices', 'Changes'])
      expect(screen.getByRole('heading', { name: h })).toBeTruthy()
    expect(screen.getByText('Last updated: November 26, 2026')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Google Ads Settings' }).getAttribute('href')).toBe('https://adssettings.google.com')
    expect(screen.getByRole('link', { name: 'Contact us' }).getAttribute('href')).toBe('/contact/')
    await waitFor(() => expect(document.title).toBe('Privacy Policy · Optimization'))
  })

  it('contact page offers GitHub issues; no email is shown unless one is configured', async () => {
    await open('/contact')
    expect(screen.getByRole('link', { name: 'Open an issue' }).getAttribute('href')).toBe('https://github.com/jmmccota/Otimizacao/issues')
    expect(screen.queryByRole('heading', { name: 'Email' })).toBeNull()
    expect(document.querySelector('a[href^="mailto:"]')).toBeNull()
    await waitFor(() => expect(document.title).toBe('Contact · Optimization'))
  })

  it('both pages are linked from the footer on every page and translated', async () => {
    const { user } = await open('/simplex')
    const footer = screen.getByRole('contentinfo')
    await user.click(within(footer).getByRole('link', { name: 'Privacy' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeTruthy()
    await user.click(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'Contact' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Contact' })).toBeTruthy()
    await i18n.changeLanguage('pt')
    expect(await screen.findByRole('heading', { level: 1, name: 'Contato' })).toBeTruthy()
  })
})

describe('static hosting', () => {
  it('slashAddress adds the missing trailing slash and keeps query and hash', () => {
    expect(slashAddress('/simplex')).toBe('/simplex/')
    expect(slashAddress('/simplex', '?x=1', '#a')).toBe('/simplex/?x=1#a')
    expect(slashAddress('/simplex/about')).toBe('/simplex/about/')
    for (const ok of ['/', '/simplex/', '/robots.txt', '/sitemap.xml', '/assets/app.js']) expect(slashAddress(ok)).toBeUndefined()
  })

  it('unknown addresses show the translated "page not found" screen with a way home', async () => {
    const { user } = await open('/nope/nothing/')
    expect(await screen.findByRole('heading', { level: 1, name: 'Page not found' })).toBeTruthy()
    await user.click(screen.getByRole('link', { name: 'Back to home' }))
    expect(await screen.findByText(/Pick a method from the menu/)).toBeTruthy()
  })

  it('links the app generates carry the trailing slash, matching the folders the host serves', async () => {
    const { user } = await open('/')
    await user.click(screen.getByRole('link', { name: 'Simplex' }))
    await waitFor(() => expect(document.title).toBe('Simplex · Optimization'))
    expect(screen.getByRole('link', { name: 'Simplex' }).getAttribute('href')).toBe('/simplex/')
  })
})
