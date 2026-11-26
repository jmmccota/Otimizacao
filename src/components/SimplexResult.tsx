import { Alert, Card, CardContent, CardHeader, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { formatNumber } from '../lib/model'
import type { SimplexResult as Result, SimplexSnapshot } from '../lib/simplex'
import { useLocale } from './hooks'
import { RichText } from './RichText'

interface Props {
  result: Result
  last: SimplexSnapshot
  iterations: number
}

/** Final summary: status, z, and the value of every variable. */
export function SimplexResult({ result, last, iterations }: Props) {
  const { t } = useTranslation('solver')
  const locale = useLocale()
  const fmt = (v: number) => formatNumber(v, locale)
  const name = (j: number) => last.labels[j]
  const optimal = result.status === 'optimal'

  return (
    <Card variant="outlined" component="section" aria-live="polite">
      <CardHeader title={t('result.title')} slotProps={{ title: { variant: 'h6', component: 'h3' } }} />
      <CardContent>
        <Stack spacing={2}>
          <Alert severity={optimal ? 'success' : 'warning'}>{t(`result.status.${result.status}`)}</Alert>
          {result.degenerate && <Alert severity="info">{t('result.degenerate')}</Alert>}
          {optimal && result.z !== null && (
            <Typography variant="h6">
              <RichText>{t('result.z')}</RichText> = {fmt(result.z)}
            </Typography>
          )}
          <Typography>
            {t('result.iterations')}: {iterations}
          </Typography>
          {optimal && (
            <>
              <div>
                <Typography variant="subtitle2">{t('result.basic')}</Typography>
                {result.basic.map((j) => (
                  <div key={j}>
                    {name(j)} = {fmt(result.variables[j])}
                  </div>
                ))}
              </div>
              <div>
                <Typography variant="subtitle2">{t('result.nonBasic')}</Typography>
                {result.nonBasic.map((j) => (
                  <div key={j}>{name(j)} = 0</div>
                ))}
              </div>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
