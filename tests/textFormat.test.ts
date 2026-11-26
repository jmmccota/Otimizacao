import { describe, expect, it } from 'vitest'
import { ModelParseError, parseModelText, serializeModelText } from '../src/lib/model'
import { solveSimplex } from '../src/lib/simplex'

// Verbatim from https://github.com/jmmccota/Otimizacao/issues/12
const ISSUE_12_FILE = `Maximize

1|2|3|

4|5|6|<=|7|
8|9|10|=|11|
12|13|14|>=|15|

0|0|0|

inf|Inf|inf|

`

describe('model text format', () => {
  it('parses the file attached to issue #12 and solves it with every method', () => {
    const model = parseModelText(ISSUE_12_FILE)
    expect(model.upper).toEqual([Infinity, Infinity, Infinity])
    expect(model.constraints).toHaveLength(3)
    for (const method of ['bigM', 'twoPhase', 'generalized'] as const) {
      const { result, history } = solveSimplex(model, method)
      expect(result.status).toBe('optimal')
      expect(result.z).toBeCloseTo(3.3, 6)
      // the original crashed with "toFixed is not a function" on these cells
      expect(history.flatMap((h) => h.tableau.flat()).every((c) => typeof c === 'number')).toBe(true)
    }
  })

  it('round-trips', () => {
    const model = parseModelText(ISSUE_12_FILE)
    expect(parseModelText(serializeModelText(model))).toEqual(model)
  })

  it('accepts a model without constraints ("nr") and CRLF line endings', () => {
    const m = parseModelText('Minimize\r\n\r\n1|1|\r\n\r\nnr\r\n\r\n0|0|\r\n\r\ninf|5|\r\n')
    expect(m.constraints).toEqual([])
    expect(m.upper).toEqual([Infinity, 5])
  })

  it.each([
    ['', 'empty'],
    ['Foo\n1|\nnr\n0|\ninf|', 'goal'],
    ['Maximize\n1|2|\n1|<=|3|\n0|0|\ninf|inf|', 'constraint'],
    ['Maximize\n1|2|\n1|1|!=|3|\n0|0|\ninf|inf|', 'relation'],
    ['Maximize\n1|2|\n1|1|<=|x|\n0|0|\ninf|inf|', 'number'],
    ['Maximize\n1|2|\nnr\n0|\ninf|inf|', 'bounds'],
  ])('rejects invalid input %#', (text, code) => {
    expect(() => parseModelText(text)).toThrowError(ModelParseError)
    try {
      parseModelText(text)
    } catch (e) {
      expect((e as ModelParseError).code).toBe(code)
    }
  })
})
