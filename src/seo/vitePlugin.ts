import type { Plugin } from 'vite'
import { normalizeSiteUrl, robotsTxt, sitemapXml } from './seo.ts'

/** Emits robots.txt and (when the public URL is known) sitemap.xml into the build output. */
export function seoFiles(siteUrlEnv: string | undefined): Plugin {
  const siteUrl = normalizeSiteUrl(siteUrlEnv)
  return {
    name: 'seo-files',
    apply: 'build',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt(siteUrl) })
      if (siteUrl) {
        this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml(siteUrl, new Date().toISOString().slice(0, 10)) })
      } else {
        this.warn('VITE_SITE_URL is not set to an http(s) URL: sitemap.xml was NOT generated and robots.txt has no Sitemap line.')
      }
    },
  }
}
