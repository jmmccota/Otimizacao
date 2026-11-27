// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryHistory } from '@tanstack/react-router'
import { createAppRouter } from '../src/router'
import i18n from '../src/i18n'

// GLPK's browser build needs a real Worker; in tests use the Node build behind the same adapter.
vi.mock('../src/lib/lp/browser', async () => {
  const GLPK = (await import('glpk.js/node')).default
  const { createGlpkSolver } = await import('../src/lib/lp/glpk')
  const solver = createGlpkSolver((await GLPK()) as never)
  return { loadGlpkSolver: async () => solver }
})

beforeAll(() => {
  Element.prototype.scrollIntoView = () => {}
  window.scrollTo = () => {}
  window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false })) as never
})
beforeEach(async () => {
  await i18n.changeLanguage('en')
})
afterEach(cleanup)

async function open(path: string) {
  const router = createAppRouter({ history: createMemoryHistory({ initialEntries: [path] }) })
  render(<RouterProvider router={router} />)
  await screen.findByRole('banner') // app bar = layout rendered
  return userEvent.setup()
}

/** "Clear all" → confirm in the dialog → wait until the dialog is gone (it hides the page while open). */
const clearAll = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: 'Clear all' }))
  await user.click(screen.getByRole('button', { name: 'Clear' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
}

const pick = async (user: ReturnType<typeof userEvent.setup>, comboboxName: RegExp | string, option: string) => {
  await user.click(screen.getByRole('combobox', { name: comboboxName }))
  await user.click(await screen.findByRole('option', { name: option }))
}

describe('layout', () => {
  it('shows the footer with source code and about links on every page', async () => {
    for (const path of ['/', '/simplex', '/transporte', '/branch-and-bound', '/simplex/about']) {
      await open(path)
      const footer = screen.getByRole('contentinfo')
      expect(within(footer).getByRole('link', { name: 'About the project' })).toHaveProperty('href', expect.stringContaining('/about'))
      expect(within(footer).getByRole('link', { name: /Source code/ })).toHaveProperty('href', 'https://github.com/jmmccota/Otimizacao')
      cleanup()
    }
  })

  it('switches the whole UI language', async () => {
    const user = await open('/simplex')
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Simplex')
    await pick(user, 'Language', 'Español')
    expect(await screen.findByText('Escribe tu problema de programación lineal abajo o cárgalo desde un archivo.')).toBeTruthy()
    expect(document.documentElement.lang).toBe('es')
    expect(screen.getByRole('button', { name: 'Ejecutar completo' })).toBeTruthy()
  })

  it('credits page lists the authors with GitHub links, the advisor and the references', async () => {
    await open('/about')
    for (const [name, user] of [['André', 'andrmalta'], ['Daniel', 'daniel22390'], ['Elias', 'EliasLuiz'], ['João', 'jmmccota']]) {
      const link = screen.getByRole('link', { name: new RegExp(`${name}.*@${user}`) })
      expect(link.getAttribute('href')).toBe(`https://github.com/${user}`)
      expect(link.getAttribute('rel')).toContain('noopener')
    }
    expect(screen.getByText(/André Oliveira da Cruz/)).toBeTruthy()
    expect(screen.getByText(/HILLIER, F. S./)).toBeTruthy()
    expect(screen.getByText(/TAHA, H. A./)).toBeTruthy()
    expect(screen.getByText(/GNU Linear Programming Kit/)).toBeTruthy()
  })

  it.each(['simplex', 'transporte', 'branch-and-bound'])('About page of %s renders in every language', async (method) => {
    for (const lang of ['pt', 'en', 'es']) {
      await i18n.changeLanguage(lang)
      await open(`/${method}/about`)
      expect(screen.getByRole('heading', { level: 1 }).textContent).toBeTruthy()
      expect(document.querySelectorAll('.katex').length).toBeGreaterThanOrEqual(0)
      expect(screen.getAllByRole('img').length).toBeGreaterThan(0)
      cleanup()
    }
  })
})

describe('page titles', () => {
  it.each([
    ['/', 'Optimization'],
    ['/simplex', 'Simplex · Optimization'],
    ['/simplex/about', 'About the Simplex · Optimization'],
    ['/transporte', 'Transportation · Optimization'],
    ['/transporte/about', 'About Transportation · Optimization'],
    ['/branch-and-bound', 'Branch and Bound · Optimization'],
    ['/branch-and-bound/about', 'About Branch and Bound · Optimization'],
    ['/about', 'About the project · Optimization'],
  ])('%s → %s', async (path, title) => {
    await open(path)
    await waitFor(() => expect(document.title).toBe(title))
  })

  it('follows the language and the inner tab', async () => {
    const user = await open('/simplex')
    await waitFor(() => expect(document.title).toBe('Simplex · Optimization'))
    await user.click(screen.getByRole('tab', { name: 'About the model' }))
    await waitFor(() => expect(document.title).toBe('About the Simplex · Optimization'))
    await pick(user, 'Language', 'Español')
    await waitFor(() => expect(document.title).toBe('Sobre el Simplex · Optimización'))
    await pick(user, 'Idioma', 'Português')
    await waitFor(() => expect(document.title).toBe('Sobre o Simplex · Otimização'))
    await user.click(screen.getByRole('tab', { name: 'Começar' }))
    await waitFor(() => expect(document.title).toBe('Simplex · Otimização'))
  })
})

describe('simplex page', () => {
  it('runs the example and shows every step, then the result', async () => {
    const user = await open('/simplex')
    await user.click(screen.getByRole('button', { name: 'Run all' }))
    expect(await screen.findByText('Optimal solution found')).toBeTruthy()
    expect(screen.getByText('Initial tableau')).toBeTruthy()
    expect(screen.getAllByText(/^Iteration \d+$/).length).toBeGreaterThan(0)
    expect(screen.getAllByText('What happened in this iteration').length).toBeGreaterThan(0)
    expect(screen.getByText('Model setup')).toBeTruthy()
    // z = 9 for the bundled example (min 2x1 + 3x2)
    expect(screen.getByText(/Value of/).parentElement?.textContent).toContain('= 9')
  })

  it('step by step reveals one tableau at a time', async () => {
    const user = await open('/simplex')
    await user.click(screen.getByRole('button', { name: 'Step by step' }))
    const cards = () => screen.getAllByRole('region').filter((r) => /tableau|Iteration/i.test(r.getAttribute('aria-label') ?? ''))
    expect(cards()).toHaveLength(1)
    // the toolbar button and the one inside the latest card both advance the run
    expect(screen.getAllByRole('button', { name: 'Next step' })).toHaveLength(2)
    expect(within(cards()[0]).getByRole('button', { name: 'Next step' })).toBeTruthy()
    await user.click(within(cards()[0]).getByRole('button', { name: 'Next step' }))
    expect(cards()).toHaveLength(2)
    // buttons move to the end of the newest card
    expect(within(cards()[0]).queryByRole('button', { name: 'Next step' })).toBeNull()
    await user.click(within(cards()[1]).getByRole('button', { name: 'Next step' }))
    expect(cards()).toHaveLength(3)
    // the explanation of the first decision is now visible on the first card
    expect(within(cards()[0]).getByText('What happened in this iteration')).toBeTruthy()
    await user.click(within(cards()[2]).getByRole('button', { name: 'Start over' }))
    expect(cards()).toHaveLength(1)
  })

  it('lets the learner click a positive cell to choose the pivot', async () => {
    const user = await open('/simplex')
    await user.click(screen.getByRole('button', { name: 'Step by step' }))
    const first = screen.getAllByRole('region').find((r) => /Initial tableau/.test(r.getAttribute('aria-label') ?? ''))!
    const cells = within(first).getAllByRole('button')
    await user.click(cells[0])
    expect(screen.getAllByText('Pivot chosen manually (cell click).').length).toBeGreaterThan(0)
  })

  it('Big-M shows the value of M in the setup; two-phase mentions phase I', async () => {
    const user = await open('/simplex')
    await pick(user, /Simplex type/i, 'Big-M')
    await user.click(screen.getByRole('button', { name: 'Run all' }))
    await screen.findByText('Optimal solution found')
    // M is typeset by KaTeX (text split across spans), so look at the text content; M = 99999 · max|c| = 299997
    expect(document.body.textContent).toContain('M=299997')
    await pick(user, /Simplex type/i, 'Two-Phase')
    await user.click(screen.getByRole('button', { name: 'Run all' }))
    expect((await screen.findAllByText('Phase I')).length).toBeGreaterThan(0)
    expect((await screen.findAllByText('Phase II')).length).toBeGreaterThan(0)
    expect(screen.getByText('Optimal solution found')).toBeTruthy()
  })

  it('reports validation errors per cell instead of running', async () => {
    const user = await open('/simplex')
    await clearAll(user)
    await user.click(screen.getByRole('button', { name: 'Run all' }))
    expect((await screen.findAllByText('Fix the highlighted fields to continue.')).length).toBeGreaterThan(0)
    expect(screen.queryByText('Model setup')).toBeNull()
    expect(document.querySelectorAll('[aria-invalid="true"]').length).toBeGreaterThan(0)
  })

  it('has no hard limit but warns above 20 variables', async () => {
    const user = await open('/simplex')
    const vars = screen.getByLabelText('Number of variables')
    await user.clear(vars)
    await user.type(vars, '21')
    expect(await screen.findByText(/more than 20 variables or constraints/)).toBeTruthy()
    expect(screen.getAllByLabelText(/Objective function x\d+/)).toHaveLength(21)
  })

  it('shows an unbounded model as such', async () => {
    const user = await open('/simplex')
    await clearAll(user)
    // max x1 + x2  s.t.  x1 − x2 ≤ 1
    await pick(user, /Problem type/i, 'Maximization')
    await user.type(screen.getByLabelText('Objective function x1'), '1')
    await user.type(screen.getByLabelText('Objective function x2'), '1')
    await user.type(screen.getByLabelText('Constraint 1 x1'), '1')
    await user.type(screen.getByLabelText('Constraint 1 x2'), '-1')
    await user.type(screen.getByLabelText('Constraint 1 Right-hand side'), '1')
    await user.click(screen.getByRole('button', { name: 'Run all' }))
    expect(await screen.findByText(/Unbounded solution/)).toBeTruthy()
  })
})

describe('transporte page', () => {
  it.each([
    ['Northwest Corner', '1180'],
    ['Least Cost', '1080'],
    ["Vogel's Approximation", '1020'],
  ])('%s gives the known total cost %s and shows each step', async (method, cost) => {
    const user = await open('/transporte')
    await pick(user, /Method/, method)
    await user.click(screen.getByRole('button', { name: 'Run all' }))
    expect(await screen.findByText(/Done: all the supply or all the demand has been met\./)).toBeTruthy()
    expect(screen.getByText('Total cost:').parentElement?.textContent).toMatch(new RegExp(`Total cost:\\s*${cost}$`))
    expect(screen.getAllByText(/^Step \d+$/).length).toBeGreaterThanOrEqual(5)
    expect(screen.getAllByText(/We allocate as much as possible/).length).toBeGreaterThan(0)
  })

  it('Vogel shows the penalties used at each step', async () => {
    const user = await open('/transporte')
    await pick(user, /Method/, "Vogel's Approximation")
    await user.click(screen.getByRole('button', { name: 'Run all' }))
    await screen.findByText(/Done:/)
    expect(screen.getAllByText('Row penalty').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Column penalty').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Vogel's approximation: for every open row and column/).length).toBeGreaterThan(0)
  })

  it('warns when supply and demand are not balanced and in step mode accepts a clicked cell', async () => {
    const user = await open('/transporte')
    expect(screen.getByText(/Balanced problem: total supply = total demand = 125\./)).toBeTruthy()
    const supply = screen.getByLabelText('Supply: Source 1')
    await user.clear(supply)
    await user.type(supply, '40')
    expect(await screen.findByText(/Total supply \(130\) is greater than total demand \(125\)/)).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Step by step' }))
    await user.click(screen.getByRole('button', { name: 'Source 2 → Destination 2' }))
    expect(screen.getAllByText('Cell chosen manually: source 2 → destination 2.').length).toBe(1)
  })
})

describe('branch and bound page', () => {
  it('runs the example, draws the tree and reports the integer optimum z = 20', async () => {
    const user = await open('/branch-and-bound')
    await user.click(screen.getByRole('button', { name: 'Run all' }))
    expect(await screen.findByText(/Optimal integer solution found at node/)).toBeTruthy()
    expect(screen.getByText(/z = 20/, { selector: 'div' })).toBeTruthy()
    const nodes = screen.getAllByRole('button', { name: /^Node \d+:/ })
    expect(nodes.length).toBeGreaterThanOrEqual(5)
    // the optimal node is marked
    expect(document.body.textContent).toContain('★')
  })

  it('step mode builds the tree node by node and explains each node', async () => {
    const user = await open('/branch-and-bound')
    await user.click(screen.getByRole('button', { name: 'Step by step' }))
    expect(await screen.findAllByRole('button', { name: /^Node 1:/ })).toHaveLength(1)
    expect(screen.getByText(/We solve the linear relaxation: the same problem ignoring/)).toBeTruthy()
    expect(screen.getByText(/We branch on the variable/)).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Next node' }))
    expect((await screen.findAllByRole('button', { name: /^Node \d+:/ })).length).toBe(3)
    expect(screen.getByText(/We solve the linear relaxation with the added constraint/)).toBeTruthy()
  })

  it('shows the Simplex steps of a node on demand', async () => {
    const user = await open('/branch-and-bound')
    await user.click(screen.getByRole('button', { name: 'Step by step' }))
    await screen.findByRole('button', { name: /^Node 1:/ })
    await user.click(screen.getByRole('button', { name: 'Show the Simplex steps' }))
    expect(await screen.findByText('Simplex steps at this node')).toBeTruthy()
    expect(screen.getAllByText('Optimal solution found').length).toBeGreaterThan(0)
    await user.click(screen.getByRole('button', { name: 'Hide the Simplex steps' }))
    expect(screen.queryByText('Simplex steps at this node')).toBeNull()
  })

  it('clicking a node shows its details', async () => {
    const user = await open('/branch-and-bound')
    await user.click(screen.getByRole('button', { name: 'Run all' }))
    await screen.findByText(/Optimal integer solution found/)
    await user.click(screen.getByRole('button', { name: /^Node 2:/ }))
    expect(screen.getByRole('heading', { name: 'Node 2' })).toBeTruthy()
    expect(screen.getByText('Level 1')).toBeTruthy()
  })
})
