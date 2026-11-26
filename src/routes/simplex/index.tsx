import { useEffect, useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Alert, MenuItem, Paper, Select, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { FileTools } from '../../components/FileTools'
import { downloadText } from '../../lib/download'
import { LargeProblemWarning } from '../../components/LargeProblemWarning'
import { ProblemEditor } from '../../components/ProblemEditor'
import { RichText } from '../../components/RichText'
import { SimplexResult } from '../../components/SimplexResult'
import { SimplexSetup } from '../../components/SimplexSetup'
import { SimplexStepCard } from '../../components/SimplexStepCard'
import { StepControls } from '../../components/StepControls'
import { useNotice } from '../../components/useNotice'
import {
  ModelParseError, emptyEditor, fromModel, isLargeProblem, parseModelText, serializeModelText, toModel,
  type EditorError, type EditorState,
} from '../../lib/model'
import { SimplexSolver, needsArtificial, type SimplexMethod, type SimplexModel, type SimplexResult as Result, type SimplexSnapshot } from '../../lib/simplex'

export const Route = createFileRoute('/simplex/')({ component: SimplexPage })

/** min 2x₁ + 3x₂  s.t.  x₁ + x₂ ≥ 4,  x₁ + 3x₂ ≥ 6  (optimum z = 9 at (3, 1)) — shows surplus + artificial variables. */
const EXAMPLE: SimplexModel = {
  goal: 'min',
  objective: [2, 3],
  constraints: [
    { coefs: [1, 1], relation: '>=', rhs: 4 },
    { coefs: [1, 3], relation: '>=', rhs: 6 },
  ],
  lower: [0, 0],
  upper: [Infinity, Infinity],
}

interface Run {
  solver: SimplexSolver
  model: SimplexModel
  method: SimplexMethod
  /** fresh copies on every update: the solver mutates the previous snapshot when a pivot is chosen */
  history: SimplexSnapshot[]
  result: Result
  done: boolean
  mode: 'all' | 'step'
}

const capture = (solver: SimplexSolver, model: SimplexModel, method: SimplexMethod, mode: Run['mode']): Run => ({
  solver, model, method, mode,
  history: solver.history.map((h) => ({ ...h })),
  result: solver.result(),
  done: solver.done,
})

function SimplexPage() {
  const { t } = useTranslation(['simplex', 'solver'])
  const [toast, notify] = useNotice()
  const [editor, setEditor] = useState<EditorState>(() => fromModel(EXAMPLE))
  const [method, setMethod] = useState<SimplexMethod>('generalized')
  const [errors, setErrors] = useState<EditorError[]>([])
  const [run, setRun] = useState<Run | null>(null)
  const lastCard = useRef<HTMLDivElement>(null)

  // bring the newest iteration into view
  const count = run?.history.length ?? 0
  useEffect(() => {
    if (count > 0) lastCard.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [count])

  const edit = (s: EditorState) => {
    setEditor(s)
    setRun(null) // results no longer match what is typed
  }

  const validate = () => {
    const r = toModel(editor)
    if (!r.ok) {
      setErrors(r.errors)
      notify(t('solver:editor.fixErrors'), 'error')
      return null
    }
    setErrors([])
    return r.model
  }

  const start = (mode: Run['mode']) => {
    const model = validate()
    if (!model) return
    const solver = new SimplexSolver(model, method)
    if (mode === 'all') solver.run()
    setRun(capture(solver, model, method, mode))
  }

  const next = () => {
    if (!run || run.done) return
    run.solver.step()
    setRun(capture(run.solver, run.model, run.method, run.mode))
  }

  const pivotAt = (col: number, row: number) => {
    if (!run || run.done) return
    run.solver.pivotAt(col, row)
    setRun(capture(run.solver, run.model, run.method, run.mode))
  }

  const onFile = (text: string) => {
    try {
      edit(fromModel(parseModelText(text)))
      setErrors([])
      notify(t('solver:file.loaded'), 'success')
    } catch (e) {
      if (e instanceof ModelParseError) notify(t(`solver:file.error.${e.code}`, { line: e.line ?? '?' }), 'error')
      else notify(t('solver:file.error.generic'), 'error')
    }
  }

  const onSave = () => {
    const model = validate()
    if (!model) return
    downloadText('modelo.txt', serializeModelText(model))
    notify(t('solver:file.saved'), 'success')
  }

  const finished = !!run?.done
  const showPhases = !!run && run.method === 'twoPhase' && needsArtificial(run.model)

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4" component="h1">
          {t('simplex:title')}
        </Typography>
        <Typography color="text.secondary">{t('simplex:subtitle')}</Typography>
      </div>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={2}>
          <FileTools
            onFile={onFile}
            onSave={onSave}
            onExample={() => {
              edit(fromModel(EXAMPLE))
              setErrors([])
            }}
            onClear={() => {
              edit(emptyEditor(editor.objective.length, 1))
              setErrors([])
            }}
            exampleLabel={t('simplex:example.label')}
          />
          <Stack direction="row" spacing={2} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography component="label" htmlFor="simplex-method">
              {t('simplex:method.label')}:
            </Typography>
            <Select
              id="simplex-method"
              size="small"
              value={method}
              inputProps={{ 'aria-label': t('simplex:method.label') }}
              onChange={(e) => {
                setMethod(e.target.value)
                setRun(null)
              }}
            >
              <MenuItem value="generalized">{t('simplex:method.generalized')}</MenuItem>
              <MenuItem value="bigM">{t('simplex:method.bigM')}</MenuItem>
              <MenuItem value="twoPhase">{t('simplex:method.twoPhase')}</MenuItem>
            </Select>
            <Typography variant="body2" color="text.secondary">
              <RichText>{t(`simplex:method.hint.${method}`)}</RichText>
            </Typography>
          </Stack>
          <LargeProblemWarning show={isLargeProblem(editor.objective.length, editor.constraints.length)} />
          <ProblemEditor state={editor} onChange={edit} errors={errors} />
          {errors.length > 0 && <Alert severity="error">{t('solver:editor.fixErrors')}</Alert>}
          <StepControls
            started={run?.mode === 'step'}
            finished={finished}
            onRunAll={() => start('all')}
            onStart={() => start('step')}
            onNext={next}
            onReset={() => start('step')}
          />
        </Stack>
      </Paper>

      {run && (
        <Stack spacing={2} aria-live="polite">
          <SimplexSetup
            model={run.model}
            method={run.method}
            setup={run.solver.setup}
            bigM={run.solver.bigM}
            noArtificial={run.method === 'twoPhase' && !needsArtificial(run.model)}
          />
          {run.history.map((snap, i) => {
            const isLast = i === run.history.length - 1
            return (
              <div key={i} ref={isLast ? lastCard : undefined}>
                <SimplexStepCard
                  snap={snap}
                  index={i}
                  showPhases={showPhases}
                  endStatus={isLast && run.done ? run.result.status : undefined}
                  onPivot={isLast && !run.done && run.mode === 'step' ? pivotAt : undefined}
                />
              </div>
            )
          })}
          {run.done && <SimplexResult result={run.result} last={run.history[run.history.length - 1]} iterations={run.history.length - 1} />}
        </Stack>
      )}
      {toast}
    </Stack>
  )
}
