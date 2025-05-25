import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/team-suggestions')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/team-suggestions"!</div>
}
