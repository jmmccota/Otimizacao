import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { AboutPage, Figure, List, P, Section } from '../../components/AboutPage'
import schema from '../../assets/about/transporte/schema.png'
import steps from '../../assets/about/transporte/steps.png'
import northwest from '../../assets/about/transporte/northwest.png'
import vogel from '../../assets/about/transporte/vogel.png'

export const Route = createFileRoute('/transporte/about')({ staticData: { titleKey: 'about:transporte.title', descriptionKey: 'meta.transporteAbout' }, component: TransporteAbout })

function TransporteAbout() {
  const { t } = useTranslation('about')
  return (
    <AboutPage title={t('transporte.title')}>
      <Section title={t('transporte.intro.title')}>
        <P>{t('transporte.intro.p1')}</P>
        <P>{t('transporte.intro.p2')}</P>
        <List items={[t('transporte.intro.criterion1'), t('transporte.intro.criterion2')]} />
        <P>{t('transporte.intro.p3')}</P>
        <Figure src={schema} caption={t('transporte.intro.schemaCaption')} />
      </Section>

      <Section title={t('transporte.algorithm.title')}>
        <P>{t('transporte.algorithm.p1')}</P>
        <Figure src={steps} caption={t('transporte.algorithm.stepsCaption')} />
        <P>{t('transporte.algorithm.p2')}</P>
        <List
          items={[
            t('transporte.algorithm.method1'),
            t('transporte.algorithm.method2'),
            t('transporte.algorithm.method3'),
          ]}
        />
      </Section>

      <Section title={t('transporte.northwest.title')}>
        <P>{t('transporte.northwest.p1')}</P>
        <Figure src={northwest} caption={t('transporte.northwest.stepsCaption')} />
      </Section>

      <Section title={t('transporte.minCost.title')}>
        <P>{t('transporte.minCost.p1')}</P>
        <P>{t('transporte.minCost.p2')}</P>
      </Section>

      <Section title={t('transporte.vogel.title')}>
        <P>{t('transporte.vogel.p1')}</P>
        <Figure src={vogel} caption={t('transporte.vogel.stepsCaption')} />
      </Section>
    </AboutPage>
  )
}
