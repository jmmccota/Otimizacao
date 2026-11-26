import { Fragment } from 'react'
import { Math } from './Math'

/**
 * Text with inline math: everything between `$…$` is rendered as TeX.
 * Translators keep the formulas in the string, e.g. "o ponto $x_2$ é escolhido".
 */
export function RichText({ children }: { children: string }) {
  const parts = children.split(/\$([^$]+)\$/g)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? <Math key={i} tex={part} /> : <Fragment key={i}>{part}</Fragment>,
      )}
    </>
  )
}
