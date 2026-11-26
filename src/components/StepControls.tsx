import { Button, Stack } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import StepIcon from '@mui/icons-material/Stairs'
import { useTranslation } from 'react-i18next'

interface Props {
  /** a run exists (step-by-step mode started) */
  started: boolean
  /** nothing left to do */
  finished: boolean
  onRunAll: () => void
  onStart: () => void
  onNext: () => void
  onReset: () => void
  nextLabel?: string
}

/** Run all | Step by step | Next step | Start over */
export function StepControls({ started, finished, onRunAll, onStart, onNext, onReset, nextLabel }: Props) {
  const { t } = useTranslation('solver')
  return (
    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
      <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={onRunAll}>
        {t('actions.runAll')}
      </Button>
      <Button variant="contained" color="secondary" startIcon={<StepIcon />} onClick={onStart}>
        {t('actions.stepByStep')}
      </Button>
      {started && (
        <>
          <Button variant="contained" color="success" startIcon={<SkipNextIcon />} disabled={finished} onClick={onNext}>
            {nextLabel ?? t('actions.nextStep')}
          </Button>
          <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={onReset}>
            {t('actions.reset')}
          </Button>
        </>
      )}
    </Stack>
  )
}
