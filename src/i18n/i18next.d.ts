import 'i18next'
import type { resources } from './index'

// Portuguese is the source of truth: keys are type-checked against it.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: (typeof resources)['pt']
  }
}
