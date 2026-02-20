import { JSX, useContext, useEffect } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import TeamScoreDisplay from "@components/team/team-score";
import { ItemTable } from "@components/table/item-table";
import { GameVersion } from "@client/api";
import { createFileRoute } from "@tanstack/react-router";
import { Ranking } from "@components/ranking";
import { GemTabRules } from "@rules/gems";

export const Route = createFileRoute("/scores/scarabs")({
  component: ScarabTab,
});

function ScarabTab(): JSX.Element {
  const { currentEvent, scores } = useContext(GlobalStateContext);
  const { rules } = Route.useSearch();
  useEffect(() => {
    if (currentEvent.game_version !== GameVersion.poe1) {
      // router.navigate("/scores?tab=Ladder");
    }
  }, [currentEvent]);
  if (!currentEvent || !scores) {
    return <></>;
  }
  const scarabCategory = scores.children.find(
    (category) => category.name === "Scarabs",
  );

  if (!scarabCategory) {
    return <></>;
  }

  return (
    <>
      {rules ? (
        <div className="my-4 w-full rounded-box bg-base-200 p-8">
          <article className="prose max-w-4xl text-left">
            <GemTabRules />
          </article>
        </div>
      ) : null}
      <div className="flex flex-col gap-4">
        <TeamScoreDisplay objective={scarabCategory} />
        <div
          key={scarabCategory.id}
          className="flex flex-col gap-8 rounded-box bg-base-200 md:p-8"
        >
          <h1 className="text-3xl font-extrabold">{scarabCategory.name}</h1>
          <div className="flex flex-col items-center gap-4">
            <Ranking
              objective={scarabCategory}
              maximum={scarabCategory.children.length}
              actual={(teamId: number) =>
                scarabCategory.children.filter((o) =>
                  o.team_score[teamId].isFinished(),
                ).length
              }
              description="Scarabs:"
            />
            <ItemTable
              objective={scarabCategory}
              className="h-[50vh] w-full"
              styles={{
                header: "bg-base-100",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
