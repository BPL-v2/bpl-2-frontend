import { JSX, useContext } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import { Daily } from "@mytypes/scoring-objective";
import TeamScoreDisplay from "@components/team-score";
import { DailyCard } from "@components/daily-card";
import { createFileRoute } from "@tanstack/react-router";
import { DailyTabRules } from "@rules/dailies";
import { ScoringMethod } from "@client/api";

export const Route = createFileRoute("/scores/dailies")({
  component: DailyTab,
});

function sortByReleaseDate(dailyA: Daily, dailyB: Daily) {
  const a = dailyA.baseObjective;
  const b = dailyB.baseObjective!;
  const releaseA = a.valid_from ? new Date(a.valid_from) : new Date();
  const releaseB = b.valid_from ? new Date(b.valid_from) : new Date();
  return releaseA.getTime() - releaseB.getTime();
}
export function DailyTab(): JSX.Element {
  const { scores, currentEvent } = useContext(GlobalStateContext);
  const dailyCategory = scores?.children.find((cat) => cat.name === "Dailies");
  const { rules } = Route.useSearch();

  if (!dailyCategory || !currentEvent) {
    return <></>;
  }
  const dailies: Record<string, Daily> = {};
  for (const objective of dailyCategory.children) {
    if (!dailies[objective.name]) {
      dailies[objective.name] = {
        baseObjective: objective,
        raceObjective: undefined,
        valid_from: objective.valid_from!,
        valid_to: objective.valid_to,
      };
    }
    if (
      objective.scoring_preset?.scoring_method === ScoringMethod.RANKED_TIME
    ) {
      dailies[objective.name].raceObjective = objective;
      dailies[objective.name].valid_to = objective.valid_to;
    } else {
      dailies[objective.name].baseObjective = objective;
    }
  }

  return (
    <>
      {rules ? (
        <div className="w-full bg-base-200  my-4  p-8 rounded-box">
          <article className="prose text-left max-w-4xl">
            <DailyTabRules />
          </article>
        </div>
      ) : null}
      <TeamScoreDisplay objective={dailyCategory}></TeamScoreDisplay>
      <div className="divider divider-primary">Dailies</div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {Object.values(dailies)
          .sort(sortByReleaseDate)
          .map((daily) => (
            <DailyCard daily={daily} key={`daily-${daily.baseObjective.id}`} />
          ))}
      </div>
    </>
  );
}
