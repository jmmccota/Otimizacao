/**
 * Parses what a learner types in a cell. Accepts decimal comma ("1,5"),
 * fractions ("3/4") and surrounding spaces. Returns null when it is not a number.
 */
export function parseNumber(text: string): number | null {
  const s = text.trim().replace(',', '.')
  if (s === '') return null
  const frac = /^([+-]?\d+(?:\.\d+)?)\s*\/\s*([+-]?\d+(?:\.\d+)?)$/.exec(s)
  if (frac) {
    const d = Number(frac[2])
    return d === 0 ? null : Number(frac[1]) / d
  }
  if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(s)) return null
  const v = Number(s)
  return Number.isFinite(v) ? v : null
}

/** Upper bounds also accept "inf" / "∞" (any case). */
export function parseUpperBound(text: string): number | null {
  const s = text.trim().toLowerCase()
  if (s === 'inf' || s === '+inf' || s === '∞' || s === 'infinity') return Infinity
  return parseNumber(text)
}

/** Shortest readable form: integers as is, otherwise up to `digits` decimals without trailing zeros. */
export function formatNumber(value: number, locale = 'pt', digits = 4): string {
  if (Number.isNaN(value)) return '—'
  if (value === Infinity) return '∞'
  if (value === -Infinity) return '−∞'
  const rounded = Math.abs(value) < 10 ** -digits / 2 ? 0 : value
  return new Intl.NumberFormat(locale, { maximumFractionDigits: digits, useGrouping: false }).format(rounded)
}
