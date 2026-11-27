import { describe, expect, it } from 'vitest'
import katex from 'katex'
import { resources } from '../src/i18n'

type Tree = { [k: string]: string | Tree }
const flatten = (t: Tree, prefix = ''): Record<string, string> =>
  Object.entries(t).reduce<Record<string, string>>((acc, [k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k
    return typeof v === 'string' ? { ...acc, [key]: v } : { ...acc, ...flatten(v, key) }
  }, {})

const langs = ['pt', 'en', 'es'] as const
const namespaces = ['common', 'about', 'solver', 'simplex', 'transporte', 'bb', 'credits', 'legal', 'home'] as const

describe('translations', () => {
  for (const ns of namespaces) {
    const pt = flatten(resources.pt[ns] as Tree)
    for (const lang of ['en', 'es'] as const) {
      it(`${lang}/${ns} has exactly the keys of pt/${ns}`, () => {
        const other = flatten(resources[lang][ns] as Tree)
        expect(Object.keys(other).sort()).toEqual(Object.keys(pt).sort())
      })
    }
  }

  for (const lang of langs)
    for (const ns of namespaces)
      it(`${lang}/${ns}: no empty strings, math is balanced and valid TeX`, () => {
        for (const [key, value] of Object.entries(flatten(resources[lang][ns] as Tree))) {
          expect(value.trim(), key).not.toBe('')
          const dollars = (value.match(/\$/g) ?? []).length
          expect(dollars % 2, `${lang}.${ns}.${key} has an unbalanced $`).toBe(0)
          value.split(/\$([^$]+)\$/g).forEach((part, i) => {
            if (i % 2 === 1) expect(() => katex.renderToString(part, { throwOnError: true }), `${key}: ${part}`).not.toThrow()
          })
        }
      })

  it('formulas and {{placeholders}} present in pt are present in en and es', () => {
    const formulas = (s: string) => (s.match(/\$[^$]+\$/g) ?? []).length
    const holes = (s: string) => (s.match(/\{\{\s*\w+\s*\}\}/g) ?? []).map((h) => h.replace(/\s/g, '')).sort()
    for (const ns of namespaces) {
      const pt = flatten(resources.pt[ns] as Tree)
      for (const lang of ['en', 'es'] as const) {
        const other = flatten(resources[lang][ns] as Tree)
        for (const [k, v] of Object.entries(pt)) {
          expect(formulas(other[k]), `${lang}.${ns}.${k}`).toBe(formulas(v))
          expect(holes(other[k]), `${lang}.${ns}.${k}`).toEqual(holes(v))
        }
      }
    }
  })
})
