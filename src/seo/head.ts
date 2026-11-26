import { normalizeSiteUrl, withTrailingSlash } from './seo.ts'

const SITE_URL = normalizeSiteUrl(import.meta.env.VITE_SITE_URL)

function headElement<K extends 'meta' | 'link'>(tag: K, selector: string, create: (el: HTMLElementTagNameMap[K]) => void) {
  let el = document.head.querySelector<HTMLElementTagNameMap[K]>(selector)
  if (!el) {
    el = document.createElement(tag)
    create(el)
    document.head.appendChild(el)
  }
  return el
}

/** Keeps <meta name="description"> and (when the public URL is known) <link rel="canonical"> in step with the page. */
export function setHead(description: string, pathname: string, siteUrl: string | undefined = SITE_URL): void {
  headElement('meta', 'meta[name="description"]', (m) => m.setAttribute('name', 'description')).setAttribute('content', description)
  if (siteUrl) {
    headElement('link', 'link[rel="canonical"]', (l) => l.setAttribute('rel', 'canonical')).setAttribute('href', siteUrl + withTrailingSlash(pathname.replace(/\/+$/, '') || '/'))
  }
}
