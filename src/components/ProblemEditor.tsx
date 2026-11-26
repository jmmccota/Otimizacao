import {
  Box, Button, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { useTranslation } from 'react-i18next'
import { addConstraint, removeConstraint, setVariableCount, type EditorError, type EditorState } from '../lib/model'
import type { Relation } from '../lib/simplex'
import { CountField } from './CountField'
import { NumField } from './NumField'

interface Props {
  state: EditorState
  onChange: (s: EditorState) => void
  errors: EditorError[]
}

const RELATIONS: Relation[] = ['<=', '=', '>=']

/** Objective, constraints and bounds of a linear program (Simplex and Branch and Bound pages). */
export function ProblemEditor({ state, onChange, errors }: Props) {
  const { t } = useTranslation('solver')
  const n = state.objective.length
  const err = (cell: string) => {
    const e = errors.find((x) => x.cell === cell)
    return e ? t(`editor.cellError.${e.code}`) : undefined
  }
  const set = (patch: Partial<EditorState>) => onChange({ ...state, ...patch })
  const setAt = (xs: string[], i: number, v: string) => xs.map((x, k) => (k === i ? v : x))
  const headers = Array.from({ length: n }, (_, j) => `x${j + 1}`)

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
        <Select
          size="small"
          value={state.goal}
          onChange={(e) => set({ goal: e.target.value })}
          inputProps={{ 'aria-label': t('editor.goal.label') }}
        >
          <MenuItem value="max">{t('editor.goal.max')}</MenuItem>
          <MenuItem value="min">{t('editor.goal.min')}</MenuItem>
        </Select>
        <CountField value={n} label={t('editor.variables')} onCommit={(v) => onChange(setVariableCount(state, v))} />
      </Stack>

      <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
        <Table size="small" aria-label={t('editor.constraints')}>
          <TableHead>
            <TableRow>
              <TableCell />
              {headers.map((h) => (
                <TableCell key={h} align="center">
                  <b>{h}</b>
                </TableCell>
              ))}
              <TableCell align="center">
                <b>{t('editor.relation')}</b>
              </TableCell>
              <TableCell align="center">
                <b>{t('editor.rhs')}</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <b>{t('editor.objective')}</b>
              </TableCell>
              {state.objective.map((v, j) => (
                <TableCell key={j} align="center">
                  <NumField
                    value={v}
                    label={`${t('editor.objective')} ${headers[j]}`}
                    error={err(`objective.${j}`)}
                    onChange={(x) => set({ objective: setAt(state.objective, j, x) })}
                  />
                </TableCell>
              ))}
              <TableCell colSpan={2} />
            </TableRow>
            {state.constraints.map((c, r) => (
              <TableRow key={r}>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <b>{t('editor.constraint', { n: r + 1 })}</b>
                </TableCell>
                {c.coefs.map((v, j) => (
                  <TableCell key={j} align="center">
                    <NumField
                      value={v}
                      label={`${t('editor.constraint', { n: r + 1 })} ${headers[j]}`}
                      error={err(`constraint.${r}.coef.${j}`)}
                      onChange={(x) =>
                        set({ constraints: state.constraints.map((k, i) => (i === r ? { ...k, coefs: setAt(k.coefs, j, x) } : k)) })
                      }
                    />
                  </TableCell>
                ))}
                <TableCell align="center">
                  <Select
                    size="small"
                    value={c.relation}
                    onChange={(e) =>
                      set({ constraints: state.constraints.map((k, i) => (i === r ? { ...k, relation: e.target.value as Relation } : k)) })
                    }
                    inputProps={{ 'aria-label': `${t('editor.constraint', { n: r + 1 })} ${t('editor.relation')}` }}
                  >
                    {RELATIONS.map((rel) => (
                      <MenuItem key={rel} value={rel}>
                        {rel === '<=' ? '≤' : rel === '>=' ? '≥' : '='}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell align="center">
                  <NumField
                    value={c.rhs}
                    width={96}
                    label={`${t('editor.constraint', { n: r + 1 })} ${t('editor.rhs')}`}
                    error={err(`constraint.${r}.rhs`)}
                    onChange={(x) =>
                      set({ constraints: state.constraints.map((k, i) => (i === r ? { ...k, rhs: x } : k)) })
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Stack direction="row" spacing={1}>
        <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => onChange(addConstraint(state))}>
          {t('editor.addConstraint')}
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<RemoveIcon />}
          disabled={state.constraints.length === 0}
          onClick={() => onChange(removeConstraint(state))}
        >
          {t('editor.removeConstraint')}
        </Button>
      </Stack>

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {t('editor.boundsTitle')}
        </Typography>
        <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
          <Table size="small" aria-label={t('editor.boundsTitle')}>
            <TableHead>
              <TableRow>
                <TableCell />
                {headers.map((h) => (
                  <TableCell key={h} align="center">
                    <b>{h}</b>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {(['lower', 'upper'] as const).map((kind) => (
                <TableRow key={kind}>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <b>{t(`editor.${kind}`)}</b>
                  </TableCell>
                  {state[kind].map((v, j) => (
                    <TableCell key={j} align="center">
                      <NumField
                        value={v}
                        label={`${t(`editor.${kind}`)} ${headers[j]}`}
                        error={err(`${kind}.${j}`)}
                        onChange={(x) => set({ [kind]: setAt(state[kind], j, x) })}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
      <Typography variant="caption" color="text.secondary">
        {t('editor.hint')}
      </Typography>
    </Stack>
  )
}
