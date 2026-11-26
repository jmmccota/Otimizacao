import { Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { formatNumber } from '../lib/model'
import type { TransporteSnapshot } from '../lib/transporte'
import { useLocale } from './hooks'

interface Props {
  snap: TransporteSnapshot
  /** Vogel penalties used to choose this step's cell (shown in an extra column and row) */
  penalties?: { rows: (number | null)[]; cols: (number | null)[] }
  /** click a free cell to choose it yourself */
  onPick?: (i: number, j: number) => void
}

/**
 * The allocation table. Each cell shows the unit cost (small) and the quantity
 * allocated (big); the chosen cell is highlighted, exhausted rows/columns are dimmed.
 */
export function TransporteTable({ snap, penalties, onPick }: Props) {
  const { t } = useTranslation('transporte')
  const locale = useLocale()
  const fmt = (v: number) => formatNumber(v, locale)
  const n = snap.cells.length
  const m = snap.cells[0].length
  const chosen = snap.chosen

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ '& td, & th': { textAlign: 'center', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' } }}>
        <TableHead>
          <TableRow>
            <TableCell />
            {Array.from({ length: m }, (_, j) => (
              <TableCell key={j} sx={{ opacity: snap.demand[j] === 0 ? 0.5 : 1 }}>
                <b>{t('editor.destination', { n: j + 1 })}</b>
              </TableCell>
            ))}
            <TableCell>
              <b>{t('editor.supply')}</b>
            </TableCell>
            {penalties && (
              <TableCell>
                <b>{t('step.penaltyRow')}</b>
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {snap.cells.map((row, i) => (
            <TableRow key={i} sx={{ opacity: snap.supply[i] === 0 ? 0.5 : 1 }}>
              <TableCell component="th" scope="row">
                <b>{t('editor.source', { n: i + 1 })}</b>
              </TableCell>
              {row.map((c, j) => {
                const isChosen = chosen?.i === i && chosen?.j === j
                const free = !c.visited && snap.supply[i] > 0 && snap.demand[j] > 0
                const clickable = !!onPick && free
                return (
                  <TableCell
                    key={j}
                    role={clickable ? 'button' : undefined}
                    tabIndex={clickable ? 0 : undefined}
                    aria-label={clickable ? `${t('editor.source', { n: i + 1 })} → ${t('editor.destination', { n: j + 1 })}` : undefined}
                    onClick={clickable ? () => onPick(i, j) : undefined}
                    onKeyDown={
                      clickable
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              onPick(i, j)
                            }
                          }
                        : undefined
                    }
                    sx={(th) => ({
                      bgcolor: isChosen ? th.palette.primary.main : c.qty > 0 ? alpha(th.palette.primary.main, 0.15) : undefined,
                      color: isChosen ? th.palette.primary.contrastText : undefined,
                      cursor: clickable ? 'pointer' : undefined,
                      '&:hover': clickable ? { outline: `2px solid ${th.palette.primary.main}`, outlineOffset: -2 } : undefined,
                      '&:focus-visible': clickable ? { outline: `3px solid ${th.palette.secondary.main}`, outlineOffset: -3 } : undefined,
                    })}
                  >
                    <Box component="span" sx={{ fontSize: '0.75em', opacity: 0.8, display: 'block', textAlign: 'right' }}>
                      {fmt(c.cost)}
                    </Box>
                    <b>{c.visited ? fmt(c.qty) : '·'}</b>
                  </TableCell>
                )
              })}
              <TableCell sx={{ bgcolor: 'action.hover' }}>
                <b>{fmt(snap.supply[i])}</b>
              </TableCell>
              {penalties && <TableCell>{penalties.rows[i] === null ? '—' : fmt(penalties.rows[i] as number)}</TableCell>}
            </TableRow>
          ))}
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            <TableCell component="th" scope="row">
              <b>{t('editor.demand')}</b>
            </TableCell>
            {snap.demand.map((d, j) => (
              <TableCell key={j}>
                <b>{fmt(d)}</b>
              </TableCell>
            ))}
            <TableCell />
            {penalties && <TableCell />}
          </TableRow>
          {penalties && (
            <TableRow>
              <TableCell component="th" scope="row">
                <b>{t('step.penaltyColumn')}</b>
              </TableCell>
              {Array.from({ length: m }, (_, j) => (
                <TableCell key={j}>{penalties.cols[j] === null ? '—' : fmt(penalties.cols[j] as number)}</TableCell>
              ))}
              <TableCell />
              <TableCell />
            </TableRow>
          )}
        </TableBody>
      </Table>
      <span hidden>{n}</span>
    </Box>
  )
}
