import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Alert, CircularProgress, Paper, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { BBNodePanel } from '../../components/BBNodePanel'
import { BBTree } from '../../components/BBTree'
import { FileTools } from '../../components/FileTools'
import { LargeProblemWarning } from '../../components/LargeProblemWarning'
import { ProblemEditor } from '../../components/ProblemEditor'
import { RichText } from '../../components/RichText'
import { StepControls } from '../../components/StepControls'
import { useLocale } from '../../components/hooks'
import { useNotice } from '../../components/useNotice'
import { BranchBound, type BBNode, type BBSummary } from '../../lib/branchbound'
import { downloadText } from '../../lib/download'
import { loadGlpkSolver } from '../../lib/lp'
import {
  ModelParseError, emptyEditor, formatNumber, fromModel, isLargeProblem, parseModelText, serializeModelText, toModel,
  type EditorError, type EditorState,
} from '../../lib/model'
import type { SimplexModel } from '../../lib/simplex'

export const Route = createFileRoute('/branch-and-bound/')({ component: BranchBoundPage })

/** max 5x₁ + 4x₂  s.t.  6x₁ + 4x₂ ≤ 24,  x₁ + 2x₂ ≤ 6  — relaxation (3, 1.5), integer optimum z = 20. */
const EXAMPLE: SimplexModel = {
  goal: 'max',
  objective: [5, 4],
  constraints: [
    { coefs: [6, 4], relation: '<=', rhs: 24 },
    { coefs: [1, 2], relation: '<=', rhs: 6 },
  ],
  lower: [0, 0],
  upper: [Infinity, Infinity],
}

interface Session {
  bb: BranchBound
  /** fresh copies on every update (the solver mutates nodes in place) */
  nodes: BBNode[]
  frontier: number[]
  summary: BBSummary
  done: boolean
  mode: 'all' | 'step'
  model: SimplexModel
}

function capture(bb: BranchBound, mode: Session['mode'], model: SimplexModel): Session {
  const summary = bb.summary() // sets the `optimal` flag, so call it before copying the nodes
  return { bb, mode, model, summary, done: bb.done, frontier: [...bb.frontier], nodes: [...bb.nodes.values()].map((n) => ({ ...n })) }
}

function BranchBoundPage() {
  const { t } = useTranslation(['bb', 'solver'])
  const locale = useLocale()
  const [toast, notify] = useNotice()
  const [editor, setEditor] = useState<EditorState>(() => fromModel(EXAMPLE))
  const [errors, setErrors] = useState<EditorError[]>([])
  const [session, setSession] = useState<Session | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState(false)

  // warm up GLPK (WASM + worker) as soon as the page opens, so solving is instant and works offline
  useEffect(() => {
    loadGlpkSolver().catch(() => undefined)
  }, [])

  const edit = (s: EditorState) => {
    setEditor(s)
    setSession(null)
    setSelected(null)
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

  const guarded = async (job: () => Promise<void>) => {
    setBusy(true)
    setFailure(false)
    try {
      await job()
    } catch {
      setFailure(true)
    } finally {
      setBusy(false)
    }
  }

  const start = (mode: Session['mode']) =>
    guarded(async () => {
      const model = validate()
      if (!model) return
      const bb = new BranchBound({ ...model }, await loadGlpkSolver())
      if (mode === 'all') await bb.run()
      else await bb.start()
      const s = capture(bb, mode, model)
      setSession(s)
      setSelected(mode === 'all' ? 1 : (bb.order[bb.order.length - 1] ?? 1))
    })

  const next = () =>
    guarded(async () => {
      if (!session || session.done) return
      await session.bb.step()
      setSession(capture(session.bb, session.mode, session.model))
      setSelected(session.bb.order[session.bb.order.length - 1] ?? null)
    })

  const choose = (id: number, variable: number) => {
    if (!session) return
    if (session.bb.setBranchVariable(id, variable)) setSession(capture(session.bb, session.mode, session.model))
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

  const node = session?.nodes.find((n) => n.id === selected)
  const s = session?.summary
  const fmt = (v: number) => formatNumber(v, locale)

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4" component="h1">
          {t('bb:title')}
        </Typography>
        <Typography color="text.secondary">{t('bb:subtitle')}</Typography>
        <Typography variant="body2" color="text.secondary">
          <RichText>{t('bb:integerNote')}</RichText>
        </Typography>
      </div>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={2}>
          <FileTools
            onFile={onFile}
            onSave={() => {
              const m = validate()
              if (!m) return
              downloadText('modelo.txt', serializeModelText(m))
              notify(t('solver:file.saved'), 'success')
            }}
            onExample={() => {
              edit(fromModel(EXAMPLE))
              setErrors([])
            }}
            onClear={() => {
              edit(emptyEditor(editor.objective.length, 1))
              setErrors([])
            }}
            exampleLabel={t('bb:example.label')}
          />
          <LargeProblemWarning show={isLargeProblem(editor.objective.length, editor.constraints.length)} />
          <ProblemEditor state={editor} onChange={edit} errors={errors} />
          {errors.length > 0 && <Alert severity="error">{t('solver:editor.fixErrors')}</Alert>}
          {failure && <Alert severity="error">{t('solver:file.error.generic')}</Alert>}
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <StepControls
              started={session?.mode === 'step'}
              finished={!!session?.done || busy}
              onRunAll={() => start('all')}
              onStart={() => start('step')}
              onNext={next}
              onReset={() => start('step')}
              nextLabel={t('bb:actions.nextNode')}
            />
            {busy && <CircularProgress size={24} aria-label="loading" />}
          </Stack>
        </Stack>
      </Paper>

      {session && s && (
        <Stack spacing={2}>
          <Typography variant="h5" component="h2">
            {t('bb:tree.title')}
          </Typography>
          <BBTree nodes={session.nodes} selected={selected} onSelect={setSelected} />

          {node ? (
            <BBNodePanel
              key={node.id}
              node={node}
              expandable={session.frontier.includes(node.id)}
              onChooseVariable={(v) => choose(node.id, v)}
            />
          ) : (
            <Alert severity="info">{t('bb:node.none')}</Alert>
          )}

          <Alert
            severity={s.status === 'optimal' ? 'success' : s.status === 'running' ? 'info' : 'warning'}
            aria-live="polite"
          >
            <b>{t('bb:summary.title')}: </b>
            {s.status === 'optimal' && t('bb:summary.optimal', { node: s.bestNode })}
            {s.status === 'infeasible' && t('bb:summary.infeasible')}
            {s.status === 'unbounded' && t('bb:summary.unbounded')}
            {s.status === 'limit' && t('bb:summary.limit', { max: s.nodes })}
            {s.status === 'running' && t('bb:summary.running', { z: s.z === null ? '—' : fmt(s.z) })}
            {s.z !== null && s.x && (
              <div>
                {t('bb:summary.best')}: z = {fmt(s.z)}; {s.x.map((v, i) => `x${i + 1} = ${fmt(v)}`).join(', ')} · {t('bb:summary.nodes')}: {s.nodes}
              </div>
            )}
          </Alert>
        </Stack>
      )}
      {toast}
    </Stack>
  )
}
