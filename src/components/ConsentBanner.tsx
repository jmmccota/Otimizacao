import { useSyncExternalStore } from 'react'
import { Box, Button, Paper, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { acceptAnalytics, getState, rejectAnalytics, subscribe } from '../lib/analytics'

/** Small bar at the bottom of the page: analytics only runs if the visitor accepts. */
export function ConsentBanner() {
  const { t } = useTranslation()
  const { bannerOpen } = useSyncExternalStore(subscribe, getState)
  if (!bannerOpen) return null
  return (
    <Paper
      component="section"
      role="region"
      aria-label={t('consent.label')}
      elevation={8}
      square
      sx={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: (th) => th.zIndex.snackbar + 1, px: 2, py: 1.25 }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' }, justifyContent: 'center' }}>
        <Typography variant="body2" sx={{ maxWidth: 720 }}>
          {t('consent.text')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
          <Button size="small" variant="contained" onClick={acceptAnalytics}>
            {t('consent.accept')}
          </Button>
          <Button size="small" variant="outlined" onClick={rejectAnalytics}>
            {t('consent.reject')}
          </Button>
        </Box>
      </Stack>
    </Paper>
  )
}
