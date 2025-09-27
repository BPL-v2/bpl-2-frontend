import { JSX, useContext, useEffect } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import TeamScoreDisplay from "@components/team-score";
import { ItemTable } from "@components/item-table";
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
    (category) => category.name === "Scarabs"
  );

  if (!scarabCategory) {
    return <></>;
  }

  return (
    <>
      {rules ? (
        <div className="w-full bg-base-200 my-4 p-8 rounded-box">
          <article className="prose text-left max-w-4xl">
            <GemTabRules />
          </article>
        </div>
      ) : null}
      <div className="flex flex-col gap-4">
        <TeamScoreDisplay objective={scarabCategory} />
        <div
          key={scarabCategory.id}
          className="bg-base-200 rounded-box md:p-8 flex flex-col gap-8"
        >
          <h1 className="text-3xl font-extrabold">{scarabCategory.name}</h1>
          <div className="flex flex-col gap-4 items-center">
            <Ranking
              objective={scarabCategory}
              maximum={scarabCategory.children.length}
              actual={(teamId: number) =>
                scarabCategory.children.filter(
                  (o) => o.team_score[teamId]?.finished
                ).length
              }
              description="Scarabs:"
            />
            <ItemTable
              objective={scarabCategory}
              className="w-full h-[50vh]"
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
