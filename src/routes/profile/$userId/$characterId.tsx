import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/$userId/$characterId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/profile/$userId/$characterId"!</div>;
}
