import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { AboutPage, Figure, Formulas, P, Section } from '../../components/AboutPage'
import example from '../../assets/about/branch-and-bound/example.png'

export const Route = createFileRoute('/branch-and-bound/about')({ staticData: { titleKey: 'about:branchBound.title', descriptionKey: 'meta.branchBoundAbout' }, component: BranchBoundAbout })

function BranchBoundAbout() {
  const { t } = useTranslation('about')
  return (
    <AboutPage title={t('branchBound.title')}>
      <Section title={t('branchBound.intro.title')}>
        <P>{t('branchBound.intro.p1')}</P>
        <P>{t('branchBound.intro.p2')}</P>
        <Figure src={example} caption={t('branchBound.intro.exampleCaption')} />
        <P>{t('branchBound.intro.p3')}</P>
        <Formulas items={[t('branchBound.intro.solution')]} />
        <P>{t('branchBound.intro.p4')}</P>
        <P>{t('branchBound.intro.p5')}</P>
      </Section>

      <Section title={t('branchBound.method.title')}>
        <P>{t('branchBound.method.p1')}</P>
        <P>{t('branchBound.method.p2')}</P>
        <P>{t('branchBound.method.p3')}</P>
        <P>{t('branchBound.method.p4')}</P>
        <Formulas items={[t('branchBound.method.formula1'), t('branchBound.method.formula2')]} />
        <P>{t('branchBound.method.p5')}</P>
      </Section>
    </AboutPage>
  )
}
