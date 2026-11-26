import { useEffect, useMemo, useRef } from 'react'
import { Box, Chip, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { hierarchy, tree, type HierarchyPointNode } from 'd3-hierarchy'
import { select } from 'd3-selection'
import { zoom, zoomIdentity } from 'd3-zoom'
import { useTranslation } from 'react-i18next'
import { formatNumber } from '../lib/model'
import type { BBNode } from '../lib/branchbound'
import { useLocale } from './hooks'

interface Props {
  nodes: BBNode[]
  selected: number | null
  onSelect: (id: number) => void
}

interface Datum {
  node: BBNode
  children: Datum[]
}

const NODE_W = 92
const NODE_H = 46
const GAP_X = 28
const GAP_Y = 86

/** The search tree, laid out with d3-hierarchy and rendered as SVG (pan / zoom with d3-zoom). */
export function BBTree({ nodes, selected, onSelect }: Props) {
  const { t } = useTranslation('bb')
  const locale = useLocale()
  const theme = useTheme()
  const svgRef = useRef<SVGSVGElement>(null)
  const gRef = useRef<SVGGElement>(null)
  const fitted = useRef(false)

  const colorOf = (n: BBNode): string => {
    if (n.optimal) return theme.palette.success.dark
    switch (n.status) {
      case 'integer': return theme.palette.success.main
      case 'branched': return theme.palette.primary.main
      case 'pruned': return theme.palette.warning.main
      case 'infeasible': return theme.palette.error.main
      default: return theme.palette.grey[500]
    }
  }

  const layout = useMemo(() => {
    const byId = new Map(nodes.map((n) => [n.id, n]))
    const root = byId.get(1)
    if (!root) return null
    const build = (n: BBNode): Datum => ({
      node: n,
      children: [n.id * 2, n.id * 2 + 1].flatMap((id) => (byId.has(id) ? [build(byId.get(id) as BBNode)] : [])),
    })
    const h = hierarchy(build(root), (d) => d.children)
    return tree<Datum>().nodeSize([NODE_W + GAP_X, NODE_H + GAP_Y])(h)
  }, [nodes])

  // pan / zoom (imperative: it must not re-render React on every wheel tick)
  useEffect(() => {
    const svg = svgRef.current
    const g = gRef.current
    if (!svg || !g) return
    const behavior = zoom<SVGSVGElement, unknown>()
      .extent(() => [[0, 0], [svg.clientWidth || 800, svg.clientHeight || 460]])
      // wheel zooms anywhere; dragging pans the canvas but a press on a node is a click, not a pan
      .filter((e: Event) => {
        const ev = e as MouseEvent
        if (ev.type === 'wheel') return true
        return !ev.ctrlKey && !ev.button && !(e.target as Element).closest?.('[role="button"]')
      })
      .scaleExtent([0.2, 3])
      .on('zoom', (e) => g.setAttribute('transform', e.transform.toString()))
    select(svg).call(behavior)
    if (!fitted.current && layout) {
      fitted.current = true
      select(svg).call(behavior.transform, zoomIdentity.translate(svg.clientWidth / 2, 40))
    }
    return () => {
      select(svg).on('.zoom', null)
    }
  }, [layout])

  const points = layout ? (layout.descendants() as HierarchyPointNode<Datum>[]) : []
  const fmt = (v: number) => formatNumber(v, locale, 3)

  return (
    <Box>
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 1 }} aria-label={t('tree.legend.title')}>
        {(['pending', 'branched', 'integer', 'pruned', 'infeasible', 'optimal'] as const).map((k) => (
          <Chip
            key={k}
            size="small"
            label={t(`tree.legend.${k}`)}
            sx={{
              bgcolor: k === 'optimal' ? theme.palette.success.dark : k === 'integer' ? theme.palette.success.main : k === 'branched' ? theme.palette.primary.main : k === 'pruned' ? theme.palette.warning.main : k === 'infeasible' ? theme.palette.error.main : theme.palette.grey[500],
              color: '#fff',
            }}
          />
        ))}
      </Stack>
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper', height: 460, overflow: 'hidden' }}>
        <svg ref={svgRef} width="100%" height="100%" role="group" aria-label={t('tree.title')} style={{ touchAction: 'none', cursor: 'grab' }}>
          <g ref={gRef}>
            {points.slice(1).map((p) => {
              const parent = p.parent as HierarchyPointNode<Datum>
              const x1 = parent.x
              const y1 = parent.y + NODE_H
              const x2 = p.x
              const y2 = p.y
              const mid = (y1 + y2) / 2
              const added = p.data.node.added
              const label = added ? `x${added.variable + 1} ${added.kind === 'upper' ? '≤' : '≥'} ${fmt(added.value)}` : ''
              return (
                <g key={`e${p.data.node.id}`}>
                  <path d={`M${x1},${y1} C${x1},${mid} ${x2},${mid} ${x2},${y2}`} fill="none" stroke={theme.palette.text.disabled} strokeWidth={1.5} />
                  <text x={(x1 + x2) / 2} y={mid - 4} textAnchor="middle" fontSize={11} fill={theme.palette.text.secondary}>
                    {label}
                  </text>
                </g>
              )
            })}
            {points.map((p) => {
              const n = p.data.node
              const isSel = n.id === selected
              const status = t(`node.status.${n.status}`)
              return (
                <g
                  key={n.id}
                  transform={`translate(${p.x - NODE_W / 2},${p.y})`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${t('node.title', { id: n.id })}: ${status}${n.z !== undefined ? `, z = ${fmt(n.z)}` : ''}`}
                  aria-pressed={isSel}
                  style={{ cursor: 'pointer', outline: 'none' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelect(n.id)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onSelect(n.id)
                    }
                  }}
                >
                  <rect
                    width={NODE_W}
                    height={NODE_H}
                    rx={10}
                    fill={colorOf(n)}
                    stroke={isSel ? theme.palette.text.primary : 'none'}
                    strokeWidth={isSel ? 3 : 0}
                  />
                  <text x={NODE_W / 2} y={18} textAnchor="middle" fontSize={12} fontWeight={700} fill="#fff">
                    {n.optimal ? '★ ' : ''}#{n.id}
                  </text>
                  <text x={NODE_W / 2} y={35} textAnchor="middle" fontSize={12} fill="#fff">
                    {n.status === 'infeasible' ? '∅' : n.z !== undefined ? `z = ${fmt(n.z)}` : '…'}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>
      </Box>
      <Typography variant="caption" color="text.secondary">
        {t('tree.hint')}
      </Typography>
    </Box>
  )
}
