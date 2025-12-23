import { TeamAtlasTree } from "@components/profile/team-atlas-tree";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/team/atlas")({
  component: RouteComponent,
});

function RouteComponent() {
  return <TeamAtlasTree />;
}
