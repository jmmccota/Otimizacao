/** Pages that belong in the sitemap (keep in sync with src/routes — a test enforces it). */
export const PUBLIC_PATHS = [
  '/',
  '/simplex',
  '/simplex/about',
  '/transporte',
  '/transporte/about',
  '/branch-and-bound',
  '/branch-and-bound/about',
  '/about',
  '/privacy',
  '/contact',
] as const

/** "https://example.com/" → "https://example.com"; anything that isn't http(s) → undefined. */
export function normalizeSiteUrl(url: string | undefined): string | undefined {
  const u = url?.trim()
  if (!u || !/^https?:\/\/[^\s/]+/i.test(u)) return undefined
  return u.replace(/\/+$/, '')
}

/** "/simplex" → "/simplex/" (the URL the static host serves for simplex/index.html); "/" stays "/". */
export const withTrailingSlash = (path: string): string => (path.endsWith('/') ? path : `${path}/`)

/**
 * The address a page should have on a static host that serves <page>/index.html:
 * "/simplex?x=1#a" → "/simplex/?x=1#a". Returns undefined when it is already fine
 * (or is a file such as /robots.txt).
 */
export function slashAddress(pathname: string, search = '', hash = ''): string | undefined {
  if (pathname.endsWith('/') || /\.[a-z0-9]+$/i.test(pathname)) return undefined
  return `${pathname}/${search}${hash}`
}

const xml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

/** sitemap.xml for the given absolute site URL. `lastmod` is an ISO date (YYYY-MM-DD). */
export function sitemapXml(siteUrl: string, lastmod: string, paths: readonly string[] = PUBLIC_PATHS): string {
  const urls = paths
    .map((p) => `  <url>\n    <loc>${xml(siteUrl + withTrailingSlash(p))}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

/** robots.txt: everything is crawlable; the sitemap line only exists when the site URL is known. */
export function robotsTxt(siteUrl?: string): string {
  return ['User-agent: *', 'Allow: /', ...(siteUrl ? ['', `Sitemap: ${siteUrl}/sitemap.xml`] : []), ''].join('\n')
}
