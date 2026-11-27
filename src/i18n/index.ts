import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import ptCommon from './locales/pt/common.json'
import enCommon from './locales/en/common.json'
import esCommon from './locales/es/common.json'
import ptAbout from './locales/pt/about.json'
import enAbout from './locales/en/about.json'
import esAbout from './locales/es/about.json'
import ptSolver from './locales/pt/solver.json'
import enSolver from './locales/en/solver.json'
import esSolver from './locales/es/solver.json'
import ptSimplex from './locales/pt/simplex.json'
import enSimplex from './locales/en/simplex.json'
import esSimplex from './locales/es/simplex.json'
import ptTransporte from './locales/pt/transporte.json'
import enTransporte from './locales/en/transporte.json'
import esTransporte from './locales/es/transporte.json'
import ptBb from './locales/pt/bb.json'
import enBb from './locales/en/bb.json'
import esBb from './locales/es/bb.json'
import ptCredits from './locales/pt/credits.json'
import ptLegal from './locales/pt/legal.json'
import ptHome from './locales/pt/home.json'
import enCredits from './locales/en/credits.json'
import enLegal from './locales/en/legal.json'
import enHome from './locales/en/home.json'
import esCredits from './locales/es/credits.json'
import esLegal from './locales/es/legal.json'
import esHome from './locales/es/home.json'

export const LANGUAGES = ['pt', 'en', 'es'] as const
export type Language = (typeof LANGUAGES)[number]

export const resources = {
  pt: { common: ptCommon, about: ptAbout, solver: ptSolver, simplex: ptSimplex, transporte: ptTransporte, bb: ptBb, credits: ptCredits, legal: ptLegal, home: ptHome },
  en: { common: enCommon, about: enAbout, solver: enSolver, simplex: enSimplex, transporte: enTransporte, bb: enBb, credits: enCredits, legal: enLegal, home: enHome },
  es: { common: esCommon, about: esAbout, solver: esSolver, simplex: esSimplex, transporte: esTransporte, bb: esBb, credits: esCredits, legal: esLegal, home: esHome },
} as const

const syncHtmlLang = (lng: string) => {
  if (typeof document !== 'undefined') document.documentElement.lang = lng
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt',
    supportedLngs: LANGUAGES,
    // "pt-BR" → "pt", "es-MX" → "es"
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    defaultNS: 'common',
    ns: ['common', 'about', 'solver', 'simplex', 'transporte', 'bb', 'credits', 'legal', 'home'],
    interpolation: { escapeValue: false }, // React already escapes
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] },
  })
  .then(() => syncHtmlLang(i18n.resolvedLanguage ?? 'pt'))

i18n.on('languageChanged', () => syncHtmlLang(i18n.resolvedLanguage ?? 'pt'))

export default i18n
