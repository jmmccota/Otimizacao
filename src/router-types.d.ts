import type { ThemeKey } from './theme/themes'

declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    theme?: ThemeKey
    /** i18n key ("namespace:path") of the page title; the deepest matched route that sets one wins */
    titleKey?: string
    /** i18n key of the meta description; the deepest matched route that sets one wins */
    descriptionKey?: string
  }
}
