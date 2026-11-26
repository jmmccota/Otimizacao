import { createFileRoute, Link as RouterLink } from '@tanstack/react-router'
import { Link, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { AboutPage, P, Section } from '../components/AboutPage'
import { REPO_URL } from '../components/Footer'

export const Route = createFileRoute('/contact')({
  staticData: { theme: 'base', titleKey: 'legal:contact.title', descriptionKey: 'meta.contact' },
  component: Contact,
})

/** Optional: set VITE_CONTACT_EMAIL at build time to show an email address. */
const EMAIL: string | undefined = import.meta.env.VITE_CONTACT_EMAIL?.trim() || undefined

function Contact() {
  const { t } = useTranslation('legal')
  return (
    <AboutPage title={t('contact.title')}>
      <P>{t('contact.intro')}</P>
      <Section title={t('contact.github.title')}>
        <P>{t('contact.github.text')}</P>
        <Link href={`${REPO_URL}/issues`} target="_blank" rel="noopener noreferrer">
          {t('contact.github.link')}
        </Link>
      </Section>
      {EMAIL && (
        <Section title={t('contact.email.title')}>
          <P>{t('contact.email.text')}</P>
          <Link href={`mailto:${EMAIL}`}>{EMAIL}</Link>
        </Section>
      )}
      <Typography>
        <Link component={RouterLink} to="/privacy">
          {t('contact.privacy')}
        </Link>
      </Typography>
    </AboutPage>
  )
}
