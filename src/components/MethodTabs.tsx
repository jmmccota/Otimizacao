import { Link, useLocation } from '@tanstack/react-router'
import { Box, Tab, Tabs } from '@mui/material'
import { useTranslation } from 'react-i18next'

type Base = '/simplex' | '/transporte' | '/branch-and-bound'

/** "Get started | About the model" tabs shown at the top of each method. */
export function MethodTabs({ base }: { base: Base }) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const onAbout = pathname.replace(/\/$/, '').endsWith('/about')
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs value={onAbout ? 'about' : 'solver'} aria-label="method sections">
        <Tab value="solver" label={t('tabs.solver')} component={Link} to={base} />
        <Tab value="about" label={t('tabs.about')} component={Link} to={`${base}/about`} />
      </Tabs>
    </Box>
  )
}
