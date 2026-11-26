import { parseNumber } from './numbers'
import type { TransporteProblem } from '../transporte/types'
import type { EditorError } from './editor'

export interface TransporteEditorState {
  costs: string[][]
  supply: string[]
  demand: string[]
}

export type TransporteEditorResult =
  | { ok: true; problem: TransporteProblem }
  | { ok: false; errors: (EditorError | { cell: string; code: 'negative' })[] }

export const emptyTransporte = (sources = 2, destinations = 2): TransporteEditorState => ({
  costs: Array.from({ length: sources }, () => Array(destinations).fill('')),
  supply: Array(sources).fill(''),
  demand: Array(destinations).fill(''),
})

export const addSource = (s: TransporteEditorState): TransporteEditorState => ({
  costs: [...s.costs, Array(s.demand.length).fill('')],
  supply: [...s.supply, ''],
  demand: s.demand,
})
export const removeSource = (s: TransporteEditorState): TransporteEditorState =>
  s.supply.length <= 1 ? s : { costs: s.costs.slice(0, -1), supply: s.supply.slice(0, -1), demand: s.demand }
export const addDestination = (s: TransporteEditorState): TransporteEditorState => ({
  costs: s.costs.map((r) => [...r, '']),
  supply: s.supply,
  demand: [...s.demand, ''],
})
export const removeDestination = (s: TransporteEditorState): TransporteEditorState =>
  s.demand.length <= 1 ? s : { costs: s.costs.map((r) => r.slice(0, -1)), supply: s.supply, demand: s.demand.slice(0, -1) }

export const fromProblem = (p: TransporteProblem): TransporteEditorState => ({
  costs: p.costs.map((r) => r.map(String)),
  supply: p.supply.map(String),
  demand: p.demand.map(String),
})

export function toProblem(s: TransporteEditorState): TransporteEditorResult {
  const errors: (EditorError | { cell: string; code: 'negative' })[] = []
  const num = (cell: string, v: string, nonNegative = false): number => {
    const n = parseNumber(v)
    if (n === null) errors.push({ cell, code: v.trim() === '' ? 'empty' : 'number' })
    else if (nonNegative && n < 0) errors.push({ cell, code: 'negative' })
    return n ?? 0
  }
  const costs = s.costs.map((row, i) => row.map((v, j) => num(`cost.${i}.${j}`, v)))
  const supply = s.supply.map((v, i) => num(`supply.${i}`, v, true))
  const demand = s.demand.map((v, j) => num(`demand.${j}`, v, true))
  return errors.length ? { ok: false, errors } : { ok: true, problem: { costs, supply, demand } }
}

/** Σ supply − Σ demand (0 = balanced). */
export const imbalance = (p: TransporteProblem): number =>
  p.supply.reduce((a, b) => a + b, 0) - p.demand.reduce((a, b) => a + b, 0)
