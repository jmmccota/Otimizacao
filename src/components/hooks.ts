import { useTranslation } from 'react-i18next'

/** Current UI language ("pt" | "en" | "es"), used for number formatting. */
export function useLocale(): string {
  const { i18n } = useTranslation()
  return i18n.resolvedLanguage ?? 'pt'
}
