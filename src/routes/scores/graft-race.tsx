import { JSX, useContext } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import TeamScoreDisplay from "@components/team/team-score";
import { ItemTable } from "@components/table/item-table";
import { createFileRoute } from "@tanstack/react-router";
import { Ranking } from "@components/ranking";
import { FoulbornUniqueTabRules } from "../../rules-alt/foulborn-uniques";

export const Route = createFileRoute("/scores/graft-race")({
  component: GraftRaceTab,
});

function GraftRaceTab(): JSX.Element {
  const { currentEvent, scores } = useContext(GlobalStateContext);
  const { rules } = Route.useSearch();

  if (!currentEvent || !scores) {
    return <></>;
  }
  const graftRaceCategory = scores.children.find(
    (category) => category.name === "Graft Race",
  );

  if (!graftRaceCategory) {
    return <></>;
  }

  return (
    <>
      {rules ? (
        <div className="my-4 w-full rounded-box bg-base-200 p-8">
          <article className="prose max-w-4xl text-left">
            <FoulbornUniqueTabRules />
          </article>
        </div>
      ) : null}
      <div className="flex flex-col gap-4">
        <TeamScoreDisplay objective={graftRaceCategory} />
        <div
          key={graftRaceCategory.id}
          className="flex flex-col gap-8 rounded-box bg-base-200 md:p-8"
        >
          <h1 className="text-3xl font-extrabold">{graftRaceCategory.name}</h1>
          <div className="flex flex-col items-center gap-4">
            <Ranking
              objective={graftRaceCategory}
              maximum={graftRaceCategory.children.length}
              actual={(teamId: number) =>
                graftRaceCategory.children.filter((o) =>
                  o.team_score[teamId].isFinished(),
                ).length
              }
              description="Items:"
            />
            <ItemTable
              objective={graftRaceCategory}
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
