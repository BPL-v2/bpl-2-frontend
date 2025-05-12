import { useContext } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import { Daily } from "@mytypes/scoring-objective";
import { getSubCategory } from "@mytypes/scoring-category";
import TeamScoreDisplay from "@components/team-score";
import { DailyCard } from "@components/daily-card";
import { createFileRoute } from "@tanstack/react-router";
import { DailyTabRules } from "@rules/dailies";
import { ruleWrapper } from "./route";

export const Route = createFileRoute("/scores/dailies")({
  component: () => ruleWrapper(<DailyTab />, <DailyTabRules />),
});

function sortByReleaseDate(dailyA: Daily, dailyB: Daily) {
  const a = dailyA.baseObjective;
  const b = dailyB.baseObjective!;
  const releaseA = a.valid_from ? new Date(a.valid_from) : new Date();
  const releaseB = b.valid_from ? new Date(b.valid_from) : new Date();
  return releaseA.getTime() - releaseB.getTime();
}
export function DailyTab() {
  const { scores, currentEvent } = useContext(GlobalStateContext);
  const category = getSubCategory(scores, "Dailies");

  if (!category || !currentEvent) {
    return <></>;
  }
  const dailies: Record<string, Daily> = {};
  for (const objective of category.objectives) {
    if (!dailies[objective.name]) {
      dailies[objective.name] = {
        baseObjective: objective,
        raceObjective: undefined,
      };
    }
    if (objective.valid_to) {
      dailies[objective.name].raceObjective = objective;
    } else {
      dailies[objective.name].baseObjective = objective;
    }
  }

  return (
    <>
      <TeamScoreDisplay category={category}></TeamScoreDisplay>
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
