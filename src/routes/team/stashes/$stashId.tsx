import { GuildStashView } from "@components/pages/guildstash-view";
import { createFileRoute, useParams, useSearch } from "@tanstack/react-router";

export type ScoreQueryParams = {
  highlightScoring: boolean;
};
export const Route = createFileRoute("/team/stashes/$stashId")({
  component: RouteComponent,
  validateSearch: (search: Record<string, boolean>): ScoreQueryParams => {
    return {
      highlightScoring: search.highlightScoring,
    };
  },
});

function RouteComponent() {
  const { stashId } = useParams({ from: Route.id });
  const { highlightScoring } = useSearch({
    from: Route.id,
  });
  return (
    <GuildStashView stashId={stashId} highlightScoring={highlightScoring} />
  );
}
