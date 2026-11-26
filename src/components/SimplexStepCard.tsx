import { Alert, Box, Card, CardContent, CardHeader, Chip, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { explainStep, type SimplexSnapshot } from '../lib/simplex'
import type { SimplexStatus } from '../lib/simplex'
import { useLocale } from './hooks'
import { RichText } from './RichText'
import { TableauView } from './TableauView'

interface Props {
  snap: SimplexSnapshot
  index: number
  /** how the run ended, only passed for the last card */
  endStatus?: SimplexStatus
  onPivot?: (col: number, row: number) => void
  showPhases: boolean
}

/** One iteration: the tableau, what the algorithm decided on it, and the row operations. */
export function SimplexStepCard({ snap, index, endStatus, onPivot, showPhases }: Props) {
  const { t } = useTranslation(['simplex', 'solver'])
  const locale = useLocale()
  const explanation = explainStep(snap, locale)

  return (
    <Card variant="outlined" component="section" aria-label={index === 0 ? t('solver:tableau.initial') : t('solver:tableau.iteration', { n: index })}>
      <CardHeader
        title={index === 0 ? t('solver:tableau.initial') : t('solver:tableau.iteration', { n: index })}
        slotProps={{ title: { variant: 'h6', component: 'h3' } }}
        action={
          showPhases ? (
            <Chip size="small" color={snap.phase === 1 ? 'warning' : 'success'} label={t(snap.phase === 1 ? 'solver:tableau.phase1' : 'solver:tableau.phase2')} />
          ) : undefined
        }
      />
      <CardContent>
        <Stack spacing={2}>
          {snap.event === 'phase2-start' && (
            <Alert severity="info" icon={false}>
              <RichText>{t('simplex:step.phase2Start')}</RichText>
            </Alert>
          )}
          <TableauView snap={snap} onPivot={onPivot} />

          {explanation && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t('simplex:step.title')}
              </Typography>
              <Stack component="ul" spacing={0.75} sx={{ m: 0, pl: 3 }}>
                {explanation.lines.map((l) => (
                  <Typography component="li" key={l.key} sx={{ lineHeight: 1.7 }}>
                    <RichText>{t(`simplex:step.${l.key}`, l.params)}</RichText>
                  </Typography>
                ))}
              </Stack>
              <Typography variant="subtitle2" sx={{ mt: 1.5 }} gutterBottom>
                {t('simplex:step.operations')}
              </Typography>
              {explanation.operations.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {t('simplex:step.noOperations')}
                </Typography>
              ) : (
                <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 3 }}>
                  {explanation.operations.map((op, k) => (
                    <Typography component="li" key={k}>
                      <RichText>{t(`simplex:step.${op.key}`, op.params)}</RichText>
                    </Typography>
                  ))}
                </Stack>
              )}
              {onPivot && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  {t('simplex:step.clickHint')}
                </Typography>
              )}
            </Box>
          )}

          {endStatus && !explanation && (
            <Alert severity={endStatus === 'optimal' ? 'success' : 'warning'} icon={false}>
              <RichText>
                {endStatus === 'optimal'
                  ? t('simplex:step.optimal')
                  : endStatus === 'unbounded'
                    ? t('simplex:step.unboundedEnd')
                    : endStatus === 'infeasible'
                      ? snap.phase === 1 && showPhases
                        ? t('simplex:step.phase1Infeasible')
                        : t('simplex:step.infeasibleEnd')
                      : t('simplex:step.limitEnd')}
              </RichText>
            </Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
