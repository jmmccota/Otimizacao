import { Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { formatNumber } from '../lib/model'
import type { SimplexSnapshot } from '../lib/simplex'
import { useLocale } from './hooks'

interface Props {
  snap: SimplexSnapshot
  /** when set, positive cells become clickable "choose this pivot" buttons */
  onPivot?: (col: number, row: number) => void
}

/** One simplex tableau: basis, coefficients, result and ratio columns, with the pivot highlighted. */
export function TableauView({ snap, onPivot }: Props) {
  const { t } = useTranslation('solver')
  const locale = useLocale()
  const tab = snap.tableau
  const last = tab[0].length - 1
  const p = snap.pivot
  const pivotCol = p && p.kind !== 'infeasible' ? p.col : -1
  const pivotRows = p?.kind === 'pivot' ? [p.row] : p?.kind === 'degenerate' ? p.rows : []
  const showRatios = !!p && p.kind !== 'infeasible' && (p.kind === 'unbounded' || p.reason === 'primal' || p.reason === 'manual')
  const ratios = tab.map((row, i) => (i > 0 && showRatios && row[pivotCol] > 0 ? row[last] / row[pivotCol] : null))
  const minRatio = Math.min(...ratios.filter((r): r is number => r !== null))
  const fmt = (v: number) => formatNumber(v, locale)

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ '& td, & th': { textAlign: 'center', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' } }}>
        <TableHead>
          <TableRow>
            <TableCell>
              <b>{t('tableau.base')}</b>
            </TableCell>
            {snap.labels.map((l, j) => (
              <TableCell key={l} sx={(th) => ({ bgcolor: j === pivotCol ? alpha(th.palette.primary.main, 0.18) : undefined })}>
                <b>
                  {l[0]}
                  <sub>{l.slice(1)}</sub>
                </b>
              </TableCell>
            ))}
            <TableCell>
              <b>{t('tableau.rhs')}</b>
            </TableCell>
            {showRatios && (
              <TableCell>
                <b>{t('tableau.ratio')}</b>
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {tab.map((row, i) => {
            const isPivotRow = pivotRows.includes(i)
            const basisLabel = i === 0 ? null : snap.labels[snap.basis[i]]
            return (
              <TableRow key={i} sx={(th) => ({ bgcolor: isPivotRow ? alpha(th.palette.primary.main, 0.18) : undefined })}>
                <TableCell component="th" scope="row">
                  <b>
                    {i === 0 ? (
                      t('tableau.z')
                    ) : basisLabel ? (
                      <>
                        {basisLabel[0]}
                        <sub>{basisLabel.slice(1)}</sub>
                      </>
                    ) : (
                      '?'
                    )}
                  </b>
                </TableCell>
                {row.map((v, j) => {
                  const isPivotCell = isPivotRow && j === pivotCol
                  const clickable = !!onPivot && i > 0 && j < last && v > 0
                  return (
                    <TableCell
                      key={j}
                      role={clickable ? 'button' : undefined}
                      tabIndex={clickable ? 0 : undefined}
                      aria-label={clickable ? `${t('tableau.base')} ${i}, ${snap.labels[j]}: ${fmt(v)}` : undefined}
                      onClick={clickable ? () => onPivot(j, i) : undefined}
                      onKeyDown={
                        clickable
                          ? (e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                onPivot(j, i)
                              }
                            }
                          : undefined
                      }
                      sx={(th) => ({
                        bgcolor: isPivotCell
                          ? th.palette.primary.main
                          : j === pivotCol
                            ? alpha(th.palette.primary.main, 0.18)
                            : undefined,
                        color: isPivotCell ? th.palette.primary.contrastText : undefined,
                        fontWeight: isPivotCell || j === last ? 700 : undefined,
                        cursor: clickable ? 'pointer' : undefined,
                        '&:hover': clickable ? { outline: `2px solid ${th.palette.primary.main}`, outlineOffset: -2 } : undefined,
                        '&:focus-visible': clickable ? { outline: `3px solid ${th.palette.secondary.main}`, outlineOffset: -3 } : undefined,
                      })}
                    >
                      {fmt(v)}
                    </TableCell>
                  )
                })}
                {showRatios && (
                  <TableCell sx={{ fontWeight: ratios[i] === minRatio && ratios[i] !== null ? 700 : undefined }}>
                    {ratios[i] === null ? '' : fmt(ratios[i])}
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Box>
  )
}
