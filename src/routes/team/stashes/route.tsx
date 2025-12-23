import { createFileRoute } from "@tanstack/react-router";
import { GuildStashSelect } from "@components/pages/guildstash-select";

export const Route = createFileRoute("/team/stashes")({
  component: RouteComponent,
});

function RouteComponent() {
  return <GuildStashSelect path="/team/stashes/$stashId" />;
}
