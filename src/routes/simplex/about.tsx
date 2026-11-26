import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { AboutPage, Figure, List, P, Section } from '../../components/AboutPage'
import feasibleRegion from '../../assets/about/simplex/feasible-region.png'
import optimalPoint from '../../assets/about/simplex/optimal-point.png'
import lpModel from '../../assets/about/simplex/lp-model.png'
import regionSteps from '../../assets/about/simplex/feasible-region-steps.png'
import structure from '../../assets/about/simplex/structure.png'
import bigMModel from '../../assets/about/simplex/big-m-model.png'
import bigM from '../../assets/about/simplex/big-m.png'
import twoPhase from '../../assets/about/simplex/two-phase.png'
import generalizedModel from '../../assets/about/simplex/generalized-model.png'
import generalizedLe from '../../assets/about/simplex/generalized-le.png'
import generalizedSlack from '../../assets/about/simplex/generalized-slack.png'

export const Route = createFileRoute('/simplex/about')({ staticData: { titleKey: 'about:simplex.title', descriptionKey: 'meta.simplexAbout' }, component: SimplexAbout })

function SimplexAbout() {
  const { t } = useTranslation('about')
  return (
    <AboutPage title={t('simplex.title')}>
      <Section title={t('simplex.intro.title')}>
        <P>{t('simplex.intro.p1')}</P>
        <P>{t('simplex.intro.p2')}</P>
        <Figure src={feasibleRegion} caption={t('simplex.intro.exampleCaption')} />
        <P>{t('simplex.intro.p3')}</P>
        <P>{t('simplex.intro.p4')}</P>
        <Figure src={optimalPoint} caption={t('simplex.intro.solution')} />
      </Section>

      <Section title={t('simplex.method.title')}>
        <P>{t('simplex.method.p1')}</P>
        <Figure src={lpModel} caption={t('simplex.method.modelCaption')} />
        <Figure src={regionSteps} caption={t('simplex.method.regionCaption')} />
        <P>{t('simplex.method.p2')}</P>
        <P>{t('simplex.method.p3')}</P>
        <P>{t('simplex.method.p4')}</P>
        <P>{t('simplex.method.p5')}</P>
        <Figure src={structure} caption={t('simplex.method.structureCaption')} />
      </Section>

      <Section title={t('simplex.bigM.title')}>
        <P>{t('simplex.bigM.p1')}</P>
        <P>{t('simplex.bigM.p2')}</P>
        <P>{t('simplex.bigM.p3')}</P>
        <Figure src={bigMModel} caption={t('simplex.bigM.modelCaption')} />
        <Figure src={bigM} caption={t('simplex.bigM.figureCaption')} />
      </Section>

      <Section title={t('simplex.twoPhase.title')}>
        <P>{t('simplex.twoPhase.p1')}</P>
        <P>{t('simplex.twoPhase.p2')}</P>
        <List items={[t('simplex.twoPhase.phase1'), t('simplex.twoPhase.phase2')]} />
        <P>{t('simplex.twoPhase.p3')}</P>
        <Figure src={twoPhase} caption={t('simplex.twoPhase.figureCaption')} />
      </Section>

      <Section title={t('simplex.generalized.title')}>
        <P>{t('simplex.generalized.p1')}</P>
        <P>{t('simplex.generalized.p2')}</P>
        <P>{t('simplex.generalized.p3')}</P>
        <Figure src={generalizedModel} caption={t('simplex.generalized.modelCaption')} />
        <Figure src={generalizedLe} caption={t('simplex.generalized.leCaption')} />
        <Figure src={generalizedSlack} caption={t('simplex.generalized.slackCaption')} />
      </Section>
    </AboutPage>
  )
}
