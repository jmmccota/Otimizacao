import katex from 'katex'
import 'katex/dist/katex.min.css'
import { Box } from '@mui/material'

/** Renders a TeX formula with KaTeX (no network, no MathJax). Invalid TeX is shown as plain text. */
export function Math({ tex, block = false }: { tex: string; block?: boolean }) {
  const html = katex.renderToString(tex, { displayMode: block, throwOnError: false, output: 'htmlAndMathml' })
  return <Box component={block ? 'div' : 'span'} dangerouslySetInnerHTML={{ __html: html }} />
}
