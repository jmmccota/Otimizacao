import { createFileRoute, Outlet } from '@tanstack/react-router'
import { MethodTabs } from '../../components/MethodTabs'

export const Route = createFileRoute('/transporte')({
  staticData: { theme: 'transporte', titleKey: 'nav.transporte', descriptionKey: 'meta.transporte' },
  component: Layout,
})

function Layout() {
  return (
    <>
      <MethodTabs base="/transporte" />
      <Outlet />
    </>
  )
}
