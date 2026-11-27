/**
 * Google Analytics 4, loaded only after the visitor accepts.
 *
 * The measurement ID is public (it is visible in any page's source), so the project's own
 * ID is the default. VITE_GA_MEASUREMENT_ID overrides it, e.g. for a staging site; an empty
 * value (an unset CI variable arrives as "") falls back to the default.
 */
export const GA_ID: string = (import.meta.env.VITE_GA_MEASUREMENT_ID ?? '').trim() || 'G-GKCC8YF8CM'

/** Google AdSense publisher ID (public; same one as in /ads.txt). Loaded only after consent too. */
export const ADSENSE_CLIENT = 'ca-pub-0522061344051122'

export type Consent = 'granted' | 'denied'

const STORAGE_KEY = 'analytics-consent'

interface State {
  consent: Consent | null
  /** the banner is showing (no choice yet, or the visitor asked to change it) */
  bannerOpen: boolean
}

const read = (): Consent | null => {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'granted' || v === 'denied' ? v : null
  } catch {
    return null // storage blocked: behave as "no choice yet", and never track
  }
}
const write = (v: Consent) => {
  try {
    localStorage.setItem(STORAGE_KEY, v)
  } catch {
    /* private mode: the choice just won't persist */
  }
}

let state: State = { consent: read(), bannerOpen: read() === null }
const listeners = new Set<() => void>()
const set = (next: State) => {
  state = next
  listeners.forEach((l) => l())
}

/* ---- tiny external store (used with useSyncExternalStore) ---- */
export const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => void listeners.delete(l)
}
export const getState = (): State => state

declare global {
  interface Window {
    dataLayer: unknown[]
    [key: `ga-disable-${string}`]: boolean | undefined
  }
}

let loaded = false

/** Injects gtag.js once. Does nothing without consent. */
export function loadAnalytics(): void {
  if (loaded || state.consent !== 'granted' || typeof document === 'undefined') return
  loaded = true
  window.dataLayer = window.dataLayer || []
  window[`ga-disable-${GA_ID}`] = false
  // gtag() must push the `arguments` object itself, not an array
  // eslint-disable-next-line prefer-rest-params
  const gtag = function (..._args: unknown[]) { window.dataLayer.push(arguments) } // eslint-disable-line @typescript-eslint/no-unused-vars
  gtag('js', new Date())
  // page views are sent manually on every route change (single-page app)
  gtag('config', GA_ID, { send_page_view: false, anonymize_ip: true })
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`
  document.head.appendChild(script)
  loadAds()
}

/** Injects the AdSense script once. Only called from loadAnalytics, i.e. after consent. */
function loadAds(): void {
  if (document.querySelector('script[data-adsense]')) return
  const ads = document.createElement('script')
  ads.async = true
  ads.crossOrigin = 'anonymous'
  ads.dataset.adsense = ''
  ads.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CLIENT)}`
  document.head.appendChild(ads)
}

export function acceptAnalytics(): void {
  write('granted')
  set({ consent: 'granted', bannerOpen: false })
  loadAnalytics()
  // the page the visitor is looking at right now counts too
  trackPageView(window.location.pathname, document.title)
}

export function rejectAnalytics(): void {
  write('denied')
  if (typeof window !== 'undefined') window[`ga-disable-${GA_ID}`] = true // stops an already-loaded tag
  set({ consent: 'denied', bannerOpen: false })
}

/** Lets the visitor change their mind (footer link). */
export function reopenConsent(): void {
  set({ ...state, bannerOpen: true })
}

/** Sends a page view when (and only when) the visitor has accepted. */
export function trackPageView(path: string, title: string): void {
  if (state.consent !== 'granted' || !loaded) return
  // eslint-disable-next-line prefer-rest-params
  const gtag = function (..._args: unknown[]) { window.dataLayer.push(arguments) } // eslint-disable-line @typescript-eslint/no-unused-vars
  gtag('event', 'page_view', { page_path: path, page_title: title })
}

/** Test helper: forget everything. */
export function resetAnalyticsForTests(): void {
  loaded = false
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
  set({ consent: null, bannerOpen: true })
}
