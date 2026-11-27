// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryHistory } from '@tanstack/react-router'
import { createAppRouter } from '../src/router'
import i18n from '../src/i18n'
import { GA_ID, getState, loadAnalytics, resetAnalyticsForTests } from '../src/lib/analytics'

const gaScripts = () => [...document.querySelectorAll('script')].filter((s) => s.src.includes('googletagmanager.com/gtag/js'))
const adScripts = () => [...document.querySelectorAll('script')].filter((s) => s.src.includes('pagead2.googlesyndication.com'))
const events = () => (window.dataLayer ?? []).map((e) => Array.from(e as ArrayLike<unknown>))
const pageViews = () => events().filter((e) => e[0] === 'event' && e[1] === 'page_view').map((e) => (e[2] as { page_path: string }).page_path)

beforeAll(() => {
  Element.prototype.scrollIntoView = () => {}
  window.scrollTo = () => {}
})
beforeEach(async () => {
  await i18n.changeLanguage('en')
  gaScripts().forEach((s) => s.remove())
  adScripts().forEach((s) => s.remove())
  window.dataLayer = []
  delete window[`ga-disable-${GA_ID}`]
  resetAnalyticsForTests()
})
afterEach(cleanup)

async function open(path = '/') {
  const router = createAppRouter({ history: createMemoryHistory({ initialEntries: [path] }) })
  render(<RouterProvider router={router} />)
  await screen.findByRole('banner')
  return userEvent.setup()
}
const banner = () => screen.queryByRole('region', { name: 'Usage analytics notice' })

describe('analytics consent', () => {
  it('asks first and loads nothing until the visitor answers', async () => {
    await open()
    expect(banner()).toBeTruthy()
    expect(screen.getByText('We collect anonymous usage data to improve this tool and show ads (Google Analytics and AdSense). Do you accept?')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Accept' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Reject' })).toBeTruthy()
    expect(gaScripts()).toHaveLength(0)
    expect(adScripts()).toHaveLength(0)
    expect(window.dataLayer).toEqual([])
  })

  it('Reject: banner closes, choice is remembered, nothing is ever loaded or sent', async () => {
    const user = await open('/simplex')
    await user.click(screen.getByRole('button', { name: 'Reject' }))
    expect(banner()).toBeNull()
    expect(localStorage.getItem('analytics-consent')).toBe('denied')
    await user.click(screen.getByRole('link', { name: 'Transportation' })) // navigate
    expect(gaScripts()).toHaveLength(0)
    expect(window.dataLayer).toEqual([])
    loadAnalytics() // e.g. next visit
    expect(gaScripts()).toHaveLength(0)
    expect(adScripts()).toHaveLength(0)
  })

  it('Accept: loads gtag.js once with the GA4 ID and counts the current page', async () => {
    const user = await open('/simplex')
    await user.click(screen.getByRole('button', { name: 'Accept' }))
    expect(banner()).toBeNull()
    expect(localStorage.getItem('analytics-consent')).toBe('granted')
    expect(gaScripts()).toHaveLength(1)
    expect(gaScripts()[0].src).toContain(`id=${GA_ID}`)
    expect(GA_ID).toBe('G-GKCC8YF8CM') // the project's GA4 property
    const cfg = events().find((e) => e[0] === 'config')!
    expect(cfg[1]).toBe(GA_ID)
    expect(cfg[2]).toMatchObject({ send_page_view: false, anonymize_ip: true })
    expect(pageViews().length).toBe(1)
    expect(adScripts()).toHaveLength(1)
    expect(adScripts()[0].src).toContain('client=ca-pub-0522061344051122')
    loadAnalytics()
    expect(gaScripts()).toHaveLength(1) // idempotent
    expect(adScripts()).toHaveLength(1)
  })

  it('after accepting, every route change (and tab) is a page view', async () => {
    const user = await open('/simplex')
    await user.click(screen.getByRole('button', { name: 'Accept' }))
    const before = pageViews().length
    await user.click(screen.getByRole('tab', { name: 'About the model' }))
    await waitFor(() => expect(pageViews().length).toBeGreaterThan(before))
    await user.click(screen.getByRole('link', { name: 'Transportation' }))
    await waitFor(() => expect(events().filter((e) => e[0] === 'event').at(-1)?.[2]).toMatchObject({ page_title: 'Transportation · Optimization' }))
  })

  it('a returning visitor: a stored "granted" loads the tag on startup, a stored "denied" never does', async () => {
    // a new page load re-reads localStorage when the module is evaluated
    localStorage.setItem('analytics-consent', 'granted')
    vi.resetModules()
    const granted = await import('../src/lib/analytics')
    expect(granted.getState()).toEqual({ consent: 'granted', bannerOpen: false })
    expect(gaScripts()).toHaveLength(0) // nothing yet…
    granted.loadAnalytics() // …until main.tsx calls this
    expect(gaScripts()).toHaveLength(1)

    gaScripts().forEach((s) => s.remove())
    localStorage.setItem('analytics-consent', 'denied')
    vi.resetModules()
    const denied = await import('../src/lib/analytics')
    expect(denied.getState()).toEqual({ consent: 'denied', bannerOpen: false })
    denied.loadAnalytics()
    expect(gaScripts()).toHaveLength(0)

    localStorage.setItem('analytics-consent', 'garbage') // tampered value = no choice
    vi.resetModules()
    expect((await import('../src/lib/analytics')).getState()).toEqual({ consent: null, bannerOpen: true })
  })

  it('the footer link lets the visitor change their mind; rejecting then disables the tag', async () => {
    const user = await open('/')
    await user.click(screen.getByRole('button', { name: 'Accept' }))
    expect(banner()).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Analytics preferences' }))
    expect(banner()).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Reject' }))
    expect(window[`ga-disable-${GA_ID}`]).toBe(true)
    expect(getState().consent).toBe('denied')
    const sent = pageViews().length
    await user.click(screen.getByRole('link', { name: 'Simplex' }))
    expect(pageViews().length).toBe(sent) // no more page views after rejecting
  })

  it.each([['pt', 'Aceitar'], ['es', 'Aceptar']])('banner is translated (%s)', async (lang, accept) => {
    await i18n.changeLanguage(lang)
    await open()
    expect(screen.getByRole('button', { name: accept })).toBeTruthy()
  })
})

describe('GA ID selection', () => {
  it('an empty override (unset CI variable) falls back to the built-in GA4 ID; a real one wins', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', '')
    expect((await import('../src/lib/analytics')).GA_ID).toBe('G-GKCC8YF8CM')
    vi.resetModules()
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', '  G-STAGING123 ')
    expect((await import('../src/lib/analytics')).GA_ID).toBe('G-STAGING123')
    vi.unstubAllEnvs()
  })
})
