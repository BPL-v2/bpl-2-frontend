import { JSX, useContext } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import TeamScoreDisplay from "@components/team-score";
import { DailyCard } from "@components/daily-card";
import { createFileRoute } from "@tanstack/react-router";
import { DailyTabRules } from "@rules/dailies";
import { ScoreObjective } from "@mytypes/score";

export const Route = createFileRoute("/scores/dailies")({
  component: DailyTab,
});

function DailyTab(): JSX.Element {
  const { scores } = useContext(GlobalStateContext);
  const dailyCategory = scores?.children.find((cat) => cat.name === "Dailies");
  const { rules } = Route.useSearch();
  if (!dailyCategory) {
    return <></>;
  }
  return (
    <>
      {rules ? (
        <div className="my-4 w-full rounded-box bg-base-200 p-8">
          <article className="prose max-w-4xl text-left">
            <DailyTabRules />
          </article>
        </div>
      ) : null}
      <div className="flex flex-col gap-4">
        <TeamScoreDisplay objective={dailyCategory}></TeamScoreDisplay>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {dailyCategory.children
            .sort((dailyA: ScoreObjective, dailyB: ScoreObjective) => {
              const releaseA = dailyA.valid_from
                ? new Date(dailyA.valid_from)
                : new Date();
              const releaseB = dailyB.valid_from
                ? new Date(dailyB.valid_from)
                : new Date();
              return releaseA.getTime() - releaseB.getTime();
            })
            .map((daily) => (
              <DailyCard daily={daily} key={`daily-${daily.id}`} />
            ))}
        </div>
      </div>
    </>
  );
}
