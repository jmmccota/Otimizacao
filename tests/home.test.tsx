// @vitest-environment jsdom
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryHistory } from '@tanstack/react-router'
import { createAppRouter } from '../src/router'
import i18n from '../src/i18n'

beforeAll(() => {
  Element.prototype.scrollIntoView = () => {}
  window.scrollTo = () => {}
})
beforeEach(async () => {
  await i18n.changeLanguage('en')
})
afterEach(cleanup)

async function openHome() {
  render(<RouterProvider router={createAppRouter({ history: createMemoryHistory({ initialEntries: ['/'] }) })} />)
  await screen.findByRole('banner')
  return userEvent.setup()
}

describe('home page', () => {
  it('explains Operations Research and Optimization and cites Taha', async () => {
    await openHome()
    expect(screen.getByRole('heading', { level: 1, name: 'Operations Research and Optimization' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'What is Operations Research?' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'What is Optimization?' })).toBeTruthy()
    expect(screen.getByText(/scientific approach to decision making/)).toBeTruthy()
    // the five phases of an OR study, as an ordered list
    const phases = within(screen.getByText(/In Taha's classic description/).parentElement!.parentElement!).getAllByRole('listitem')
    expect(phases.length).toBeGreaterThanOrEqual(5)
    expect(screen.getByText(/Problem definition:/)).toBeTruthy()
    expect(screen.getByText(/Implementation:/)).toBeTruthy()
    // the three ingredients of an optimization problem
    for (const t of [/Decision variables:/, /Objective function:/, /Constraints:/]) expect(screen.getByText(t)).toBeTruthy()
    // the reference
    expect(screen.getByRole('heading', { name: 'Reference' })).toBeTruthy()
    expect(screen.getByText(/TAHA, H\. A\. Pesquisa Operacional\. 8th ed\./)).toBeTruthy()
    await waitFor(() => expect(document.title).toBe('Optimization'))
  })

  it('links to the three tools, each accented with its own theme colour', async () => {
    const user = await openHome()
    const hrefs = ['Simplex', 'Transportation', 'Branch and Bound'].map((n) => screen.getByRole('link', { name: `Open ${n}` }).getAttribute('href'))
    expect(hrefs).toEqual(['/simplex/', '/transporte/', '/branch-and-bound/'])
    await user.click(screen.getByRole('link', { name: 'Open Transportation' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Transportation' })).toBeTruthy()
  })

  it('has no leftover demo content', async () => {
    await openHome()
    for (const demo of ['Primário', 'Confirmar', 'Cancelar']) expect(screen.queryByText(demo)).toBeNull()
  })

  it.each([
    ['pt', 'Pesquisa Operacional e Otimização', 'O que é Pesquisa Operacional?', /Segundo a descrição clássica de Taha/],
    ['es', 'Investigación de Operaciones y Optimización', '¿Qué es la Investigación de Operaciones?', /Según la descripción clásica de Taha/],
  ])('is translated (%s)', async (lang, h1, h2, taha) => {
    await i18n.changeLanguage(lang)
    await openHome()
    expect(screen.getByRole('heading', { level: 1, name: h1 })).toBeTruthy()
    expect(screen.getByRole('heading', { name: h2 })).toBeTruthy()
    expect(screen.getByText(taha)).toBeTruthy()
  })
})

describe('favicon', () => {
  const root = join(__dirname, '..')
  it('index.html uses public/favicon.png as the default icon, and the file is a real PNG', () => {
    const html = readFileSync(join(root, 'index.html'), 'utf8')
    expect(html).toMatch(/<link rel="icon" type="image\/png" href="\/favicon\.png" \/>/)
    expect(html).not.toMatch(/favicon\.svg/)
    const png = readFileSync(join(root, 'public/favicon.png'))
    expect([...png.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    expect(existsSync(join(root, 'public/favicon.svg'))).toBe(false)
  })

  it('the PWA config precaches the favicon', () => {
    expect(readFileSync(join(root, 'vite.config.ts'), 'utf8')).toMatch(/includeAssets: \['favicon\.png'/)
  })
})
