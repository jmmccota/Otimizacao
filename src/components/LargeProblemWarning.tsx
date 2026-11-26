import { Alert } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { LARGE_PROBLEM_THRESHOLD } from '../lib/model'

/** Shown when the problem is big enough that rendering every step may freeze the browser. */
export function LargeProblemWarning({ show }: { show: boolean }) {
  const { t } = useTranslation('solver')
  if (!show) return null
  return (
    <Alert severity="warning" sx={{ mb: 2 }}>
      {t('warnings.large', { limit: LARGE_PROBLEM_THRESHOLD })}
    </Alert>
  )
}
