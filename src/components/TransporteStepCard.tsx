import { Alert, Card, CardActions, CardContent, CardHeader, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { formatNumber } from '../lib/model'
import type { TransporteSnapshot } from '../lib/transporte'
import { useLocale } from './hooks'
import { RichText } from './RichText'
import { TransporteTable } from './TransporteTable'

interface Props {
  snap: TransporteSnapshot
  index: number
  isLast: boolean
  /** true when every unit of supply or demand was assigned */
  done: boolean
  onPick?: (i: number, j: number) => void
  /** buttons rendered at the bottom of the card (next step / start over) */
  actions?: ReactNode
}

/** One iteration: why the cell was chosen, how much was allocated, what ran out, and the running cost. */
export function TransporteStepCard({ snap, index, isLast, done, onPick, actions }: Props) {
  const { t } = useTranslation('transporte')
  const locale = useLocale()
  const fmt = (v: number) => formatNumber(v, locale)
  const step = snap.step
  const i = step ? step.cell.i + 1 : 0
  const j = step ? step.cell.j + 1 : 0

  const reason = (() => {
    if (!step) return null
    const r = step.reason
    if (r.kind === 'northwest') return t('step.northwest', { i, j })
    if (r.kind === 'minCost') return t('step.minCost', { cost: fmt(r.cost), i, j })
    if (r.kind === 'manual') return t('step.manual', { i, j })
    return t('step.vogel', {
      penalty: fmt(r.pick.penalty),
      type: t(r.pick.type === 'row' ? 'step.typeRow' : 'step.typeColumn'),
      index: r.pick.index + 1,
      i,
      j,
    })
  })()

  // Σ c·x over the cells allocated so far, e.g. "8·35 + 6·10"
  const terms = snap.cells.flat().filter((c) => c.qty > 0).map((c) => `${fmt(c.cost)} \\cdot ${fmt(c.qty)}`)
  const unmetSupply = snap.supply.reduce((a, b) => a + b, 0)
  const unmetDemand = snap.demand.reduce((a, b) => a + b, 0)

  return (
    <Card variant="outlined" component="section" aria-label={index === 0 ? t('step.initial') : t('step.title', { n: index })}>
      <CardHeader
        title={index === 0 ? t('step.initial').split(':')[0] : t('step.title', { n: index })}
        slotProps={{ title: { variant: 'h6', component: 'h3' } }}
      />
      <CardContent>
        <Stack spacing={2}>
          {step ? (
            <Stack component="ul" spacing={0.75} sx={{ m: 0, pl: 3 }}>
              <Typography component="li">{reason}</Typography>
              <Typography component="li">
                <RichText>{t('step.allocate', { supply: fmt(step.supplyBefore), demand: fmt(step.demandBefore), amount: fmt(step.amount) })}</RichText>
              </Typography>
              <Typography component="li">
                {step.exhausted === 'row'
                  ? t('step.exhaustedRow', { i })
                  : step.exhausted === 'column'
                    ? t('step.exhaustedColumn', { j })
                    : t('step.exhaustedBoth', { i, j })}
              </Typography>
              <Typography component="li">
                <RichText>{t('step.cost', { terms: terms.join(' + '), total: fmt(snap.totalCost) })}</RichText>
              </Typography>
            </Stack>
          ) : (
            <Typography>{t('step.initial')}</Typography>
          )}

          <TransporteTable
            snap={snap}
            onPick={onPick}
            penalties={step?.reason.kind === 'vogel' ? { rows: step.reason.rowPenalties, cols: step.reason.colPenalties } : undefined}
          />

          {isLast && onPick && (
            <Typography variant="caption" color="text.secondary">
              {t('step.clickHint')}
            </Typography>
          )}
          {isLast && done && (
            <Stack spacing={1}>
              <Alert severity="success" icon={false}>
                {t('step.done')}
              </Alert>
              {unmetSupply > 0 && <Alert severity="warning">{t('step.unmetSupply', { amount: fmt(unmetSupply) })}</Alert>}
              {unmetDemand > 0 && <Alert severity="warning">{t('step.unmetDemand', { amount: fmt(unmetDemand) })}</Alert>}
            </Stack>
          )}
        </Stack>
      </CardContent>
      {actions && <CardActions sx={{ px: 2, pb: 2, flexWrap: 'wrap', gap: 1 }}>{actions}</CardActions>}
    </Card>
  )
}
