import { Button } from '@mui/material'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import { useTranslation } from 'react-i18next'

interface Props {
  finished: boolean
  onNext: () => void
  onReset: () => void
}

/** Next step | Start over, shown at the bottom of the latest step card so the user need not scroll back up. */
export function StepNav({ finished, onNext, onReset }: Props) {
  const { t } = useTranslation('solver')
  return (
    <>
      <Button variant="contained" color="success" startIcon={<SkipNextIcon />} disabled={finished} onClick={onNext}>
        {t('actions.nextStep')}
      </Button>
      <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={onReset}>
        {t('actions.reset')}
      </Button>
    </>
  )
}
