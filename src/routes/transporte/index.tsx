import { useEffect, useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Alert, MenuItem, Paper, Select, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { FileTools } from '../../components/FileTools'
import { LargeProblemWarning } from '../../components/LargeProblemWarning'
import { StepControls } from '../../components/StepControls'
import { TransporteEditor } from '../../components/TransporteEditor'
import { TransporteStepCard } from '../../components/TransporteStepCard'
import { useLocale } from '../../components/hooks'
import { useNotice } from '../../components/useNotice'
import {
  LARGE_PROBLEM_THRESHOLD, ModelParseError, emptyTransporte, formatNumber, fromProblem, imbalance, parseTransporteText,
  serializeTransporteText, toProblem, type TransporteEditorState,
} from '../../lib/model'
import { downloadText } from '../../lib/download'
import { TransporteSolver, type TransporteMethod, type TransporteProblem, type TransporteSnapshot } from '../../lib/transporte'
import { RichText } from '../../components/RichText'

export const Route = createFileRoute('/transporte/')({ component: TransportePage })

/** Classic 3×4 problem (supply 35/50/40, demand 45/20/30/30). */
const EXAMPLE: TransporteProblem = {
  costs: [[8, 6, 10, 9], [9, 12, 13, 7], [14, 9, 16, 5]],
  supply: [35, 50, 40],
  demand: [45, 20, 30, 30],
}

interface Run {
  solver: TransporteSolver
  history: TransporteSnapshot[]
  done: boolean
  mode: 'all' | 'step'
}

const capture = (solver: TransporteSolver, mode: Run['mode']): Run => ({
  solver,
  mode,
  history: solver.history.map((h) => ({ ...h })),
  done: solver.done,
})

function TransportePage() {
  const { t } = useTranslation(['transporte', 'solver'])
  const locale = useLocale()
  const [toast, notify] = useNotice()
  const [editor, setEditor] = useState<TransporteEditorState>(() => fromProblem(EXAMPLE))
  const [method, setMethod] = useState<TransporteMethod>('northwest')
  const [errors, setErrors] = useState<{ cell: string; code: string }[]>([])
  const [run, setRun] = useState<Run | null>(null)
  const lastCard = useRef<HTMLDivElement>(null)

  const count = run?.history.length ?? 0
  useEffect(() => {
    if (count > 0) lastCard.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [count])

  const edit = (s: TransporteEditorState) => {
    setEditor(s)
    setRun(null)
  }

  const validate = () => {
    const r = toProblem(editor)
    if (!r.ok) {
      setErrors(r.errors)
      notify(t('solver:editor.fixErrors'), 'error')
      return null
    }
    setErrors([])
    return r.problem
  }

  const start = (mode: Run['mode']) => {
    const problem = validate()
    if (!problem) return
    const solver = new TransporteSolver(problem, method)
    if (mode === 'all') solver.run()
    setRun(capture(solver, mode))
  }

  const next = () => {
    if (!run || run.done) return
    run.solver.step()
    setRun(capture(run.solver, run.mode))
  }

  const pick = (i: number, j: number) => {
    if (!run || run.done) return
    run.solver.stepAt({ i, j })
    setRun(capture(run.solver, run.mode))
  }

  // balance hint, only when every cell is already valid
  const parsed = toProblem(editor)
  const diff = parsed.ok ? imbalance(parsed.problem) : null
  const totalSupply = parsed.ok ? parsed.problem.supply.reduce((a, b) => a + b, 0) : 0
  const totalDemand = parsed.ok ? parsed.problem.demand.reduce((a, b) => a + b, 0) : 0
  const fmt = (v: number) => formatNumber(v, locale)

  const large = editor.supply.length > LARGE_PROBLEM_THRESHOLD || editor.demand.length > LARGE_PROBLEM_THRESHOLD

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4" component="h1">
          {t('transporte:title')}
        </Typography>
        <Typography color="text.secondary">{t('transporte:subtitle')}</Typography>
      </div>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={2}>
          <FileTools
            onFile={(text) => {
              try {
                edit(fromProblem(parseTransporteText(text)))
                setErrors([])
                notify(t('solver:file.loaded'), 'success')
              } catch (e) {
                if (e instanceof ModelParseError) notify(t(`solver:file.error.${e.code}`, { line: e.line ?? '?' }), 'error')
                else notify(t('solver:file.error.generic'), 'error')
              }
            }}
            onSave={() => {
              const p = validate()
              if (!p) return
              downloadText('modelo.txt', serializeTransporteText(p))
              notify(t('solver:file.saved'), 'success')
            }}
            onExample={() => {
              edit(fromProblem(EXAMPLE))
              setErrors([])
            }}
            onClear={() => {
              edit(emptyTransporte(editor.supply.length, editor.demand.length))
              setErrors([])
            }}
            exampleLabel={t('transporte:example.label')}
          />
          <Stack direction="row" spacing={2} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography component="label" htmlFor="transporte-method">
              {t('transporte:method.label')}:
            </Typography>
            <Select
              id="transporte-method"
              size="small"
              value={method}
              inputProps={{ 'aria-label': t('transporte:method.label') }}
              onChange={(e) => {
                setMethod(e.target.value)
                setRun(null)
              }}
            >
              <MenuItem value="northwest">{t('transporte:method.northwest')}</MenuItem>
              <MenuItem value="minCost">{t('transporte:method.minCost')}</MenuItem>
              <MenuItem value="vogel">{t('transporte:method.vogel')}</MenuItem>
            </Select>
            <Typography variant="body2" color="text.secondary">
              <RichText>{t(`transporte:method.hint.${method}`)}</RichText>
            </Typography>
          </Stack>
          <LargeProblemWarning show={large} />
          <TransporteEditor state={editor} onChange={edit} errors={errors} />
          {diff !== null && (
            <Alert severity={diff === 0 ? 'success' : 'warning'}>
              {diff === 0
                ? t('transporte:balance.balanced', { total: fmt(totalSupply) })
                : diff > 0
                  ? t('transporte:balance.moreSupply', { supply: fmt(totalSupply), demand: fmt(totalDemand), diff: fmt(diff) })
                  : t('transporte:balance.moreDemand', { supply: fmt(totalSupply), demand: fmt(totalDemand), diff: fmt(-diff) })}
            </Alert>
          )}
          {errors.length > 0 && <Alert severity="error">{t('solver:editor.fixErrors')}</Alert>}
          <StepControls
            started={run?.mode === 'step'}
            finished={!!run?.done}
            onRunAll={() => start('all')}
            onStart={() => start('step')}
            onNext={next}
            onReset={() => start('step')}
          />
        </Stack>
      </Paper>

      {run && (
        <Stack spacing={2} aria-live="polite">
          {run.history.map((snap, i) => {
            const isLast = i === run.history.length - 1
            return (
              <div key={i} ref={isLast ? lastCard : undefined}>
                <TransporteStepCard
                  snap={snap}
                  index={i}
                  isLast={isLast}
                  done={run.done}
                  onPick={isLast && !run.done && run.mode === 'step' ? pick : undefined}
                />
              </div>
            )
          })}
          {run.done && (
            <Alert severity="success" variant="outlined">
              <b>{t('transporte:result.totalCost')}:</b> {fmt(run.history[run.history.length - 1].totalCost)}
            </Alert>
          )}
        </Stack>
      )}
      {toast}
    </Stack>
  )
}
