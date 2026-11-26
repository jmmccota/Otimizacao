import { createFileRoute, Outlet } from '@tanstack/react-router'
import { MethodTabs } from '../../components/MethodTabs'

export const Route = createFileRoute('/simplex')({
  staticData: { theme: 'simplex', titleKey: 'nav.simplex', descriptionKey: 'meta.simplex' },
  component: Layout,
})

function Layout() {
  return (
    <>
      <MethodTabs base="/simplex" />
      <Outlet />
    </>
  )
}
