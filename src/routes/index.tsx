import { createFileRoute, Link as RouterLink } from '@tanstack/react-router'
import { Box, Button, Card, CardActions, CardContent, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { AboutPage, List, P, Section } from '../components/AboutPage'
import { themes } from '../theme/themes'

export const Route = createFileRoute('/')({
  staticData: { theme: 'base', descriptionKey: 'meta.home' },
  component: Home,
})

/** Each tool card is accented with the colour of that tool's own theme. */
const TOOLS = [
  { to: '/simplex/', nav: 'nav.simplex', text: 'tools.simplex', color: themes.simplex.palette.primary.main },
  { to: '/transporte/', nav: 'nav.transporte', text: 'tools.transporte', color: themes.transporte.palette.primary.main },
  { to: '/branch-and-bound/', nav: 'nav.branchBound', text: 'tools.branchBound', color: themes.branchBound.palette.primary.main },
] as const

function Home() {
  const { t } = useTranslation('home')
  const { t: tc } = useTranslation()
  return (
    <AboutPage title={t('hero.title')}>
      <Typography variant="h6" component="p" color="text.secondary" sx={{ mt: -2 }}>
        {t('hero.subtitle')}
      </Typography>

      <Section title={t('or.title')}>
        <P>{t('or.p1')}</P>
        <P>{t('or.p2')}</P>
        <P>{t('or.stepsIntro')}</P>
        <List items={[t('or.step1'), t('or.step2'), t('or.step3'), t('or.step4'), t('or.step5')]} />
        <P>{t('or.p3')}</P>
      </Section>

      <Section title={t('opt.title')}>
        <P>{t('opt.p1')}</P>
        <List ordered={false} items={[t('opt.variables'), t('opt.objective'), t('opt.constraints')]} />
        <P>{t('opt.p2')}</P>
        <P>{t('opt.p3')}</P>
      </Section>

      <Section title={t('tools.title')}>
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
          {TOOLS.map((tool) => (
            <Card key={tool.to} variant="outlined" sx={{ borderTop: 6, borderTopColor: tool.color, display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  {tc(tool.nav)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t(tool.text)}
                </Typography>
              </CardContent>
              <CardActions>
                <Button component={RouterLink} to={tool.to} aria-label={`${t('tools.open')} ${tc(tool.nav)}`} sx={{ color: tool.color }}>
                  {t('tools.open')}
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      </Section>

      <Section title={t('how.title')}>
        <P>{t('how.text')}</P>
      </Section>

      <Section title={t('reference.title')}>
        <P>{t('reference.text')}</P>
      </Section>
    </AboutPage>
  )
}
