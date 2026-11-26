import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { registerSW } from 'virtual:pwa-register'
import './i18n'
import { loadAnalytics } from './lib/analytics'
import { createAppRouter } from './router'
import { slashAddress } from './seo/seo'
import './index.css'

// A page has a single URL, the one the static host serves: /simplex → /simplex/
const fixed = slashAddress(location.pathname, location.search, location.hash)
if (fixed) history.replaceState(history.state, '', fixed)

const router = createAppRouter()

registerSW({ immediate: true })
loadAnalytics() // only does something if the visitor accepted on a previous visit

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
