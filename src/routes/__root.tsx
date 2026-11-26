import { useEffect } from 'react'
import { createRootRoute, Link, Outlet, useLocation, useMatches } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import {
  AppBar,
  Box,
  Button,
  Container,
  CssBaseline,
  ThemeProvider,
  Toolbar,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { ConsentBanner } from '../components/ConsentBanner'
import { Footer } from '../components/Footer'
import { trackPageView } from '../lib/analytics'
import { setHead } from '../seo/head'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { themes, type ThemeKey } from '../theme/themes'

export const Route = createRootRoute({ component: RootLayout })

const links = [
  { to: '/branch-and-bound', key: 'nav.branchBound' },
  { to: '/simplex', key: 'nav.simplex' },
  { to: '/transporte', key: 'nav.transporte' },
] as const

function RootLayout() {
  const { t } = useTranslation()
  // The deepest matched route that declares a theme / title wins.
  const matches = useMatches()
  const titleKey = [...matches].reverse().find((m) => m.staticData?.titleKey)?.staticData.titleKey
  const page = titleKey ? t(titleKey as never) : ''
  const title = page ? `${page} · ${t('app.name')}` : t('app.name')
  const descriptionKey = [...matches].reverse().find((m) => m.staticData?.descriptionKey)?.staticData.descriptionKey
  const description = t((descriptionKey ?? 'meta.home') as never)
  const { pathname } = useLocation()
  useEffect(() => {
    document.title = title
    trackPageView(pathname, title) // no-op unless the visitor accepted analytics
  }, [title, pathname])
  useEffect(() => {
    setHead(description, pathname)
  }, [description, pathname])
  const key: ThemeKey =
    [...matches].reverse().find((m) => m.staticData?.theme)?.staticData.theme ?? 'base'

  return (
    <ThemeProvider theme={themes[key]}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar sx={{ gap: 1, flexWrap: 'wrap' }}>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ mr: 2, color: 'inherit', textDecoration: 'none' }}
          >
            {t('app.name')}
          </Typography>
          {links.map((l) => (
            <Button key={l.to} color="inherit" component={Link} to={l.to}>
              {t(l.key)}
            </Button>
          ))}
          <Box sx={{ flexGrow: 1 }} />
          <LanguageSwitcher />
        </Toolbar>
      </AppBar>
      <Box sx={{ minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
        <Container component="main" sx={{ py: 4, flexGrow: 1 }}>
          <Outlet />
        </Container>
        <Footer />
      </Box>
      <ConsentBanner />
      {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
    </ThemeProvider>
  )
}
