import { createFileRoute } from '@tanstack/react-router'
import { Box, Link, Stack, Typography } from '@mui/material'
import GitHubIcon from '@mui/icons-material/GitHub'
import { useTranslation } from 'react-i18next'
import { AboutPage, P, Section } from '../components/AboutPage'
import { REPO_URL } from '../components/Footer'

export const Route = createFileRoute('/about')({
  staticData: { theme: 'base', titleKey: 'credits:title', descriptionKey: 'meta.credits' },
  component: Credits,
})

/** Authors of the original SIMO project (from the repository README). */
const AUTHORS = [
  { name: 'André', github: 'andrmalta' },
  { name: 'Daniel', github: 'daniel22390' },
  { name: 'Elias', github: 'EliasLuiz' },
  { name: 'João', github: 'jmmccota' },
] as const

function Credits() {
  const { t } = useTranslation('credits')
  return (
    <AboutPage title={t('title')}>
      <Section title={t('project')}>
        <P>{t('intro')}</P>
      </Section>

      <Section title={t('advisor.title')}>
        <Typography>{t('advisor.text')}</Typography>
      </Section>

      <Section title={t('authors.title')}>
        <Stack component="ul" spacing={1} sx={{ m: 0, p: 0, listStyle: 'none' }}>
          {AUTHORS.map((a) => (
            <Box component="li" key={a.github}>
              <Link href={`https://github.com/${a.github}`} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                <GitHubIcon fontSize="small" aria-hidden />
                {a.name} <Typography component="span" color="text.secondary">@{a.github}</Typography>
              </Link>
            </Box>
          ))}
        </Stack>
        <Typography color="text.secondary">{t('authors.thanks')}</Typography>
      </Section>

      <Section title={t('links.title')}>
        <Stack spacing={1}>
          <Link href={REPO_URL} target="_blank" rel="noopener noreferrer">
            {t('links.repo')}
          </Link>
          <Typography>{t('links.license')}</Typography>
        </Stack>
      </Section>

      <Section title={t('refs.title')}>
        <Typography variant="subtitle1" component="h3">
          {t('refs.books')}
        </Typography>
        <Stack component="ul" spacing={1} sx={{ m: 0, pl: 3 }}>
          <li>{t('refs.hillier')}</li>
          <li>{t('refs.taha')}</li>
        </Stack>
        <Typography variant="subtitle1" component="h3">
          {t('refs.tools')}
        </Typography>
        <Stack component="ul" spacing={1} sx={{ m: 0, pl: 3 }}>
          <li>{t('refs.glpk')}</li>
          <li>{t('refs.libs')}</li>
        </Stack>
      </Section>
    </AboutPage>
  )
}
