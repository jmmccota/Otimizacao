import { Link as RouterLink } from '@tanstack/react-router'
import { Button, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

/** Shown for unknown URLs (GitHub Pages serves this app from 404.html for them). */
export function NotFound() {
  const { t } = useTranslation()
  return (
    <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
      <Typography variant="h4" component="h1">
        {t('notFound.title')}
      </Typography>
      <Typography>{t('notFound.text')}</Typography>
      <Button variant="contained" component={RouterLink} to="/">
        {t('notFound.home')}
      </Button>
    </Stack>
  )
}
