import { Alert, Card, CardContent, CardHeader, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { formatNumber, modelToTex } from '../lib/model'
import type { SetupRow, SimplexMethod, SimplexModel } from '../lib/simplex'
import { objectiveRowTex, setupRowTex } from '../lib/simplex/explain'
import { useLocale } from './hooks'
import { Math } from './Math'
import { RichText } from './RichText'

interface Props {
  model: SimplexModel
  method: SimplexMethod
  setup: SetupRow[]
  bigM?: number
  /** two-phase on a model whose constraints are all ≤: no phase I needed */
  noArtificial: boolean
}

/** "Preparation of the model": the formulation and how every row became an equation. */
export function SimplexSetup({ model, method, setup, bigM, noArtificial }: Props) {
  const { t } = useTranslation(['simplex', 'solver'])
  const locale = useLocale()
  const intro =
    method === 'bigM'
      ? t('simplex:setup.bigM', { m: formatNumber(bigM ?? 0, locale) })
      : method === 'generalized'
        ? t('simplex:setup.generalized')
        : noArtificial
          ? t('simplex:setup.twoPhaseNoArtificial')
          : t('simplex:setup.twoPhase')

  return (
    <Card variant="outlined" component="section" aria-label={t('simplex:setup.title')}>
      <CardHeader title={t('simplex:setup.title')} slotProps={{ title: { variant: 'h6', component: 'h3' } }} />
      <CardContent sx={{ display: 'grid', gap: 2 }}>
        <Alert severity="info" icon={false}>
          <RichText>{intro}</RichText>
        </Alert>

        <div>
          <Typography variant="subtitle2" gutterBottom>
            {t('solver:model.title')}
          </Typography>
          {modelToTex(model, { locale }).map((l) => (
            <div key={l}>
              <Math tex={l} />
            </div>
          ))}
        </div>

        <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>{t('simplex:setup.columns.source')}</TableCell>
                <TableCell>{t('simplex:setup.columns.transform')}</TableCell>
                <TableCell>{t('simplex:setup.columns.added')}</TableCell>
                <TableCell>{t('simplex:setup.columns.after')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {setup.map((row) => {
                const tex = setupRowTex(model, row, locale)
                return (
                  <TableRow key={row.row}>
                    <TableCell>
                      <b>
                        {row.source.type === 'constraint'
                          ? t('simplex:setup.constraint', { n: row.source.index + 1 })
                          : `${row.source.kind === 'lower' ? '≥' : '≤'} x${row.source.variable + 1}`}
                      </b>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Math tex={tex.original} />
                    </TableCell>
                    <TableCell>{t(`simplex:setup.transform.${row.transform}`)}</TableCell>
                    <TableCell>{row.added.join(', ')}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Math tex={tex.augmented} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Paper>

        <Typography>
          <RichText>{t('simplex:setup.objective', { tex: `$${objectiveRowTex(model, locale)}$` })}</RichText>
        </Typography>
      </CardContent>
    </Card>
  )
}
