import { Button, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { useTranslation } from 'react-i18next'
import {
  addDestination, addSource, removeDestination, removeSource, type TransporteEditorState,
} from '../lib/model'
import { NumField } from './NumField'

interface Props {
  state: TransporteEditorState
  onChange: (s: TransporteEditorState) => void
  errors: { cell: string; code: string }[]
}

/** Cost grid with the supply of every source (right) and the demand of every destination (bottom). */
export function TransporteEditor({ state, onChange, errors }: Props) {
  const { t } = useTranslation('transporte')
  const { t: ts } = useTranslation('solver')
  const err = (cell: string) => {
    const e = errors.find((x) => x.cell === cell)
    return e ? ts(`editor.cellError.${e.code as 'empty'}`) : undefined
  }
  const setCost = (i: number, j: number, v: string) =>
    onChange({ ...state, costs: state.costs.map((r, a) => (a === i ? r.map((c, b) => (b === j ? v : c)) : r)) })

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
        <Table size="small" aria-label={t('editor.cost')}>
          <TableHead>
            <TableRow>
              <TableCell />
              {state.demand.map((_, j) => (
                <TableCell key={j} align="center">
                  <b>{t('editor.destination', { n: j + 1 })}</b>
                </TableCell>
              ))}
              <TableCell align="center">
                <b>{t('editor.supply')}</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {state.costs.map((row, i) => (
              <TableRow key={i}>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <b>{t('editor.source', { n: i + 1 })}</b>
                </TableCell>
                {row.map((v, j) => (
                  <TableCell key={j} align="center">
                    <NumField
                      value={v}
                      label={`${t('editor.cost')}: ${t('editor.source', { n: i + 1 })} → ${t('editor.destination', { n: j + 1 })}`}
                      error={err(`cost.${i}.${j}`)}
                      onChange={(x) => setCost(i, j, x)}
                    />
                  </TableCell>
                ))}
                <TableCell align="center" sx={{ bgcolor: 'action.hover' }}>
                  <NumField
                    value={state.supply[i]}
                    label={`${t('editor.supply')}: ${t('editor.source', { n: i + 1 })}`}
                    error={err(`supply.${i}`)}
                    onChange={(x) => onChange({ ...state, supply: state.supply.map((s, k) => (k === i ? x : s)) })}
                  />
                </TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell>
                <b>{t('editor.demand')}</b>
              </TableCell>
              {state.demand.map((v, j) => (
                <TableCell key={j} align="center">
                  <NumField
                    value={v}
                    label={`${t('editor.demand')}: ${t('editor.destination', { n: j + 1 })}`}
                    error={err(`demand.${j}`)}
                    onChange={(x) => onChange({ ...state, demand: state.demand.map((d, k) => (k === j ? x : d)) })}
                  />
                </TableCell>
              ))}
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
        <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => onChange(addSource(state))}>
          {t('editor.addSource')}
        </Button>
        <Button variant="contained" color="error" startIcon={<RemoveIcon />} disabled={state.supply.length <= 1} onClick={() => onChange(removeSource(state))}>
          {t('editor.removeSource')}
        </Button>
        <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => onChange(addDestination(state))}>
          {t('editor.addDestination')}
        </Button>
        <Button variant="contained" color="error" startIcon={<RemoveIcon />} disabled={state.demand.length <= 1} onClick={() => onChange(removeDestination(state))}>
          {t('editor.removeDestination')}
        </Button>
      </Stack>
      <Typography variant="caption" color="text.secondary">
        {t('editor.hint')}
      </Typography>
    </Stack>
  )
}
