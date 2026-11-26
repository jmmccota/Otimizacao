import { createFileRoute, Link as RouterLink } from '@tanstack/react-router'
import { Link, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { AboutPage, P, Section } from '../components/AboutPage'
import { useLocale } from '../components/hooks'

export const Route = createFileRoute('/privacy')({
  staticData: { theme: 'base', titleKey: 'legal:privacy.title', descriptionKey: 'meta.privacy' },
  component: Privacy,
})

/** Bump this when the policy text changes. */
export const PRIVACY_UPDATED = '2026-11-26'

function Privacy() {
  const { t } = useTranslation('legal')
  const locale = useLocale()
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(PRIVACY_UPDATED))
  return (
    <AboutPage title={t('privacy.title')}>
      <Typography color="text.secondary">{t('privacy.updated', { date })}</Typography>
      <P>{t('privacy.intro')}</P>
      <Section title={t('privacy.local.title')}>
        <P>{t('privacy.local.text')}</P>
      </Section>
      <Section title={t('privacy.storage.title')}>
        <P>{t('privacy.storage.text')}</P>
      </Section>
      <Section title={t('privacy.analytics.title')}>
        <P>{t('privacy.analytics.text')}</P>
      </Section>
      <Section title={t('privacy.ads.title')}>
        <P>{t('privacy.ads.text')}</P>
        <Stack component="ul" spacing={1} sx={{ m: 0, pl: 3 }}>
          <li>
            <Link href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
              {t('privacy.ads.adsSettings')}
            </Link>
          </li>
          <li>
            <Link href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
              {t('privacy.ads.partnerSites')}
            </Link>
          </li>
        </Stack>
      </Section>
      <Section title={t('privacy.choices.title')}>
        <P>{t('privacy.choices.text')}</P>
        <Link component={RouterLink} to="/contact">
          {t('privacy.contactLink')}
        </Link>
      </Section>
      <Section title={t('privacy.changes.title')}>
        <P>{t('privacy.changes.text')}</P>
      </Section>
    </AboutPage>
  )
}
