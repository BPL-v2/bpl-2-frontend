import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/team/atlas")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/team/atlas"!</div>;
}
