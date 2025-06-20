import TwitchEmbed from "@components/twitch-embed";
import { createFileRoute, useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/streams/$twitchAccount")({
  component: RouteComponent,
});

function RouteComponent() {
  const { twitchAccount } = useParams({ from: Route.fullPath });
  return <TwitchEmbed channel={twitchAccount} />;
}
