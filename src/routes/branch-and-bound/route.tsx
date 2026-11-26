import { createFileRoute, Outlet } from '@tanstack/react-router'
import { MethodTabs } from '../../components/MethodTabs'

export const Route = createFileRoute('/branch-and-bound')({
  staticData: { theme: 'branchBound', titleKey: 'nav.branchBound', descriptionKey: 'meta.branchBound' },
  component: Layout,
})

function Layout() {
  return (
    <>
      <MethodTabs base="/branch-and-bound" />
      <Outlet />
    </>
  )
}
