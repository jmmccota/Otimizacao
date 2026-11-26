import type { Constraint, Relation, SetupRow, SimplexModel, Tableau } from './types'

export interface Built {
  tableau: Tableau
  basis: number[]
  /** columns of artificial variables */
  artificial: number[]
  /** name of every column except the right-hand side */
  labels: string[]
  /** how each constraint row was built */
  setup: SetupRow[]
  /** value of M (Big-M only) */
  bigM?: number
}

type Tagged = Constraint & { source: SetupRow['source'] }

/** Parses a bound typed by the user: "inf", "Inf", "INF", "∞" or a number. */
export function parseBound(value: string | number): number {
  if (typeof value === 'number') return value
  const s = value.trim().toLowerCase()
  if (s === 'inf' || s === '+inf' || s === 'infinity' || s === '∞') return Infinity
  if (s === '-inf' || s === '-infinity' || s === '-∞') return -Infinity
  return Number(s.replace(',', '.'))
}

/** User constraints followed by the bound rows (x_i ≥ lower, x_i ≤ upper), in variable order. */
export function withBoundRows(model: SimplexModel): Constraint[] {
  return taggedRows(model)
}

function taggedRows(model: SimplexModel): Tagged[] {
  const n = model.objective.length
  const unit = (i: number) => Array.from({ length: n }, (_, j) => (j === i ? 1 : 0))
  const rows: Tagged[] = model.constraints.map((c, index) => ({
    ...c,
    coefs: [...c.coefs],
    source: { type: 'constraint', index },
  }))
  for (let i = 0; i < n; i++) {
    if (model.lower[i] !== 0)
      rows.push({ coefs: unit(i), relation: '>=', rhs: model.lower[i], source: { type: 'bound', variable: i, kind: 'lower' } })
    if (model.upper[i] !== Infinity)
      rows.push({ coefs: unit(i), relation: '<=', rhs: model.upper[i], source: { type: 'bound', variable: i, kind: 'upper' } })
  }
  return rows
}

/** Row 0 of the original objective in the engine's convention (max → −c, min → c). */
export const objectiveRow = (model: SimplexModel): number[] =>
  model.goal === 'max' ? model.objective.map((c) => -c) : [...model.objective]

/** Multiplies a constraint by −1 when its RHS is negative so every RHS is ≥ 0. */
function normalizeRhs(c: Constraint): Constraint {
  if (c.rhs >= 0) return c
  const relation = c.relation === '<=' ? '>=' : c.relation === '>=' ? '<=' : '='
  return { coefs: c.coefs.map((v) => -v), relation, rhs: -c.rhs }
}

/**
 * Big-M and Two-Phase share the augmentation:
 *   ≤ → slack (+1, basic)
 *   ≥ → artificial (+1, basic) then surplus (−1)
 *   = → artificial (+1, basic)
 * `artificialCost` is M (Big-M) or 1 (phase 1).
 */
function augment(model: SimplexModel, baseRow: number[], artificialCost: number): Built {
  const tagged = taggedRows(model)
  const rows = tagged.map((c) => ({ ...normalizeRhs(c), source: c.source }))
  const n = model.objective.length
  const tableau: Tableau = [[...baseRow], ...rows.map((r) => [...r.coefs])]
  const basis: number[] = [-1]
  const artificial: number[] = []
  const labels: string[] = Array.from({ length: n }, (_, i) => `x${i + 1}`)
  const setup: SetupRow[] = []

  const addColumn = (cost: number, row: number, value: number, label: string): number => {
    tableau[0].push(cost)
    for (let r = 1; r < tableau.length; r++) tableau[r].push(r === row ? value : 0)
    labels.push(label)
    return tableau[0].length - 1
  }

  rows.forEach((c, k) => {
    const row = k + 1
    const added: string[] = []
    if (c.relation === '<=') {
      basis[row] = addColumn(0, row, 1, `s${row}`)
      added.push(`s${row}`)
    } else {
      const col = addColumn(artificialCost, row, 1, `a${row}`)
      artificial.push(col)
      basis[row] = col
      added.push(`a${row}`)
      if (c.relation === '>=') {
        addColumn(0, row, -1, `e${row}`)
        added.push(`e${row}`)
      }
    }
    const orig = tagged[k]
    setup.push({
      row,
      source: c.source,
      original: { relation: orig.relation, rhs: orig.rhs },
      transform: orig.rhs < 0 ? 'flipped' : 'none',
      relation: c.relation,
      added,
    })
  })

  tableau[0].push(0)
  rows.forEach((c, k) => tableau[k + 1].push(c.rhs))
  return { tableau, basis, artificial, labels, setup }
}

/** Big-M: M is large relative to the objective coefficients. */
export function bigMValue(objective: number[]): number {
  const scale = Math.max(1, ...objective.map((c) => Math.abs(c)))
  return 99999 * scale
}

export function buildBigM(model: SimplexModel): Built {
  const M = bigMValue(model.objective)
  return { ...augment(model, objectiveRow(model), M), bigM: M }
}

/** Phase 1 minimises the sum of the artificial variables. */
export function buildPhase1(model: SimplexModel): Built {
  return augment(model, model.objective.map(() => 0), 1)
}

export const needsArtificial = (model: SimplexModel): boolean =>
  withBoundRows(model)
    .map(normalizeRhs)
    .some((c) => c.relation !== '<=')

/**
 * Generalized (dual-simplex style): every constraint becomes "≤"
 * (= is split in two, ≥ is negated) so only slack variables are needed and a
 * negative RHS is repaired by dual pivots.
 */
export function buildGeneralized(model: SimplexModel): Built {
  type Row = { coefs: number[]; rhs: number; source: SetupRow['source']; original: SetupRow['original']; transform: SetupRow['transform'] }
  const le: Row[] = []
  for (const c of taggedRows(model)) {
    const original = { relation: c.relation as Relation, rhs: c.rhs }
    const neg = { coefs: c.coefs.map((v) => -v), rhs: -c.rhs }
    if (c.relation === '<=') le.push({ coefs: [...c.coefs], rhs: c.rhs, source: c.source, original, transform: 'none' })
    else if (c.relation === '>=') le.push({ ...neg, source: c.source, original, transform: 'negated' })
    else
      le.push(
        { coefs: [...c.coefs], rhs: c.rhs, source: c.source, original, transform: 'split-first' },
        { ...neg, source: c.source, original, transform: 'split-second' },
      )
  }
  const n = model.objective.length
  const labels: string[] = Array.from({ length: n }, (_, i) => `x${i + 1}`)
  const tableau: Tableau = [[...objectiveRow(model)], ...le.map((r) => [...r.coefs])]
  const basis: number[] = [-1]
  const setup: SetupRow[] = []
  le.forEach((r, k) => {
    tableau[0].push(0)
    for (let i = 1; i < tableau.length; i++) tableau[i].push(i === k + 1 ? 1 : 0)
    basis[k + 1] = tableau[0].length - 1
    labels.push(`s${k + 1}`)
    setup.push({ row: k + 1, source: r.source, original: r.original, transform: r.transform, relation: '<=', added: [`s${k + 1}`] })
  })
  tableau[0].push(0)
  le.forEach((r, k) => tableau[k + 1].push(r.rhs))
  return { tableau, basis, artificial: [], labels, setup }
}
