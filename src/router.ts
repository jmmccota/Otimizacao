import { createRouter, type RouterHistory } from '@tanstack/react-router'
import { NotFound } from './components/NotFound'
import { routeTree } from './routeTree.gen'

/**
 * One place that builds the router, used by the app and by the tests.
 * Trailing slashes ("/simplex/") match the folders the static host serves
 * (each page is built to <page>/index.html), so a URL never redirects.
 */
export function createAppRouter(options: { history?: RouterHistory } = {}) {
  return createRouter({
    routeTree,
    trailingSlash: 'always',
    defaultNotFoundComponent: NotFound,
    history: options.history,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}
