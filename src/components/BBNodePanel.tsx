import { useState } from 'react'
import { Alert, Button, Card, CardContent, CardHeader, Chip, MenuItem, Select, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { formatNumber, modelToTex } from '../lib/model'
import type { BBNode } from '../lib/branchbound'
import { SimplexSolver, needsArtificial, type SimplexMethod } from '../lib/simplex'
import { useLocale } from './hooks'
import { Math } from './Math'
import { RichText } from './RichText'
import { SimplexResult } from './SimplexResult'
import { SimplexSetup } from './SimplexSetup'
import { SimplexStepCard } from './SimplexStepCard'

interface Props {
  node: BBNode
  /** the node is waiting to be expanded, so the branching variable can still be changed */
  expandable: boolean
  onChooseVariable: (variable: number) => void
}

/** Everything the learner should know about one node, including its own Simplex steps. */
export function BBNodePanel({ node, expandable, onChooseVariable }: Props) {
  const { t } = useTranslation(['bb', 'solver', 'simplex'])
  const locale = useLocale()
  const fmt = (v: number) => formatNumber(v, locale, 4)
  const [showSteps, setShowSteps] = useState(false)
  const [method, setMethod] = useState<SimplexMethod>('generalized')

  const bound = node.added
    ? t(node.added.kind === 'upper' ? 'bb:explain.boundUpper' : 'bb:explain.boundLower', { i: node.added.variable + 1, v: fmt(node.added.value) })
    : ''

  const lines: string[] = []
  lines.push(node.parent === null ? t('bb:explain.root') : t('bb:explain.child', { bound }))
  if (node.status === 'infeasible') lines.push(t('bb:explain.infeasible'))
  if (node.status === 'integer') {
    lines.push(t('bb:explain.integer'))
    lines.push(node.improved ? t('bb:explain.newBest', { z: fmt(node.z ?? 0) }) : t('bb:explain.notBest'))
  }
  if (node.status === 'pruned') lines.push(t('bb:explain.pruned', { z: fmt(node.z ?? 0), inc: fmt(node.incumbent ?? 0) }))
  if (node.status === 'branched' && node.branch) {
    const list = (node.candidates ?? []).map((c) => `$x_{${c.variable + 1}}$ = ${fmt(c.value)} (${fmt(c.distance)})`).join('; ')
    lines.push(
      t(node.branch.manual ? 'bb:explain.branchedManual' : 'bb:explain.branched', {
        list,
        i: node.branch.variable + 1,
        value: fmt(node.branch.value),
        floor: fmt(Math_floor(node.branch.value)),
        ceil: fmt(Math_ceil(node.branch.value)),
      }),
    )
  }

  // Simplex steps for this node's own LP relaxation
  const run = showSteps ? (() => { const s = new SimplexSolver(node.model, method); s.run(); return s })() : null
  const showPhases = method === 'twoPhase' && needsArtificial(node.model)

  return (
    <Card variant="outlined" component="section" aria-live="polite">
      <CardHeader
        title={t('bb:node.title', { id: node.id })}
        subheader={t('bb:node.depth', { n: node.depth })}
        slotProps={{ title: { variant: 'h6', component: 'h3' } }}
        action={<Chip label={t(`bb:node.status.${node.status}`)} color={node.optimal ? 'success' : 'default'} />}
      />
      <CardContent>
        <Stack spacing={2}>
          {node.z !== undefined && node.x && (
            <Stack spacing={0.5}>
              <Typography>
                <RichText>{t('bb:node.z')}</RichText> = <b>{fmt(node.z)}</b>
              </Typography>
              <Typography>
                <RichText>{t('bb:node.x')}</RichText>: {node.x.map((v, i) => `x${i + 1} = ${fmt(v)}`).join(',  ')}
              </Typography>
            </Stack>
          )}

          <div>
            <Typography variant="subtitle2" gutterBottom>
              {t('bb:explain.title')}
            </Typography>
            <Stack component="ul" spacing={0.75} sx={{ m: 0, pl: 3 }}>
              {lines.map((l, i) => (
                <Typography component="li" key={i} sx={{ lineHeight: 1.7 }}>
                  <RichText>{l}</RichText>
                </Typography>
              ))}
            </Stack>
          </div>

          {expandable && node.candidates && node.candidates.length > 1 && (
            <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="body2">{t('bb:explain.chooseVar')}</Typography>
              <Select
                size="small"
                value={node.branch?.variable ?? node.candidates[0].variable}
                onChange={(e) => onChooseVariable(Number(e.target.value))}
                inputProps={{ 'aria-label': t('bb:explain.chooseVar') }}
              >
                {node.candidates.map((c) => (
                  <MenuItem key={c.variable} value={c.variable}>
                    x{c.variable + 1} = {fmt(c.value)}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
          )}

          <div>
            <Typography variant="subtitle2" gutterBottom>
              {t('bb:node.model')}
            </Typography>
            {modelToTex(node.model, { integer: true, locale }).map((l) => (
              <div key={l}>
                <Math tex={l} />
              </div>
            ))}
          </div>

          <Stack direction="row" spacing={2} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Button variant="outlined" onClick={() => setShowSteps((v) => !v)}>
              {showSteps ? t('bb:simplex.hide') : t('bb:simplex.show')}
            </Button>
            {showSteps && (
              <Select size="small" value={method} onChange={(e) => setMethod(e.target.value)} inputProps={{ 'aria-label': t('bb:simplex.method') }}>
                <MenuItem value="generalized">{t('simplex:method.generalized')}</MenuItem>
                <MenuItem value="bigM">{t('simplex:method.bigM')}</MenuItem>
                <MenuItem value="twoPhase">{t('simplex:method.twoPhase')}</MenuItem>
              </Select>
            )}
          </Stack>

          {run && (
            <Stack spacing={2}>
              <Typography variant="h6" component="h4">
                {t('bb:simplex.title')}
              </Typography>
              <SimplexSetup model={node.model} method={method} setup={run.setup} bigM={run.bigM} noArtificial={method === 'twoPhase' && !needsArtificial(node.model)} />
              {run.history.map((snap, i) => (
                <SimplexStepCard
                  key={i}
                  snap={{ ...snap }}
                  index={i}
                  showPhases={showPhases}
                  endStatus={i === run.history.length - 1 ? run.result().status : undefined}
                />
              ))}
              <SimplexResult result={run.result()} last={run.history[run.history.length - 1]} iterations={run.history.length - 1} />
            </Stack>
          )}
          {node.status === 'pending' && <Alert severity="info">{t('bb:node.status.pending')}</Alert>}
        </Stack>
      </CardContent>
    </Card>
  )
}

const Math_floor = (v: number) => globalThis.Math.floor(v + 1e-9)
const Math_ceil = (v: number) => globalThis.Math.ceil(v - 1e-9)
