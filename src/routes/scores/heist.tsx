import { JSX, useContext, useEffect } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import TeamScoreDisplay from "@components/team/team-score";
import { ItemTable } from "@components/table/item-table";
import { GameVersion, ScoringMethod } from "@client/api";
import { Ranking } from "@components/ranking";
import { createFileRoute } from "@tanstack/react-router";
import { HeistTabRules } from "@rules/heist";

export const Route = createFileRoute("/scores/heist")({
  component: HeistTab,
});

function HeistTab(): JSX.Element {
  const { scores, currentEvent } = useContext(GlobalStateContext);
  const { rules } = Route.useSearch();
  const heistCategory = scores?.children.find(
    (category) => category.name === "Heist",
  );
  useEffect(() => {
    if (currentEvent.game_version !== GameVersion.poe1) {
      // router.navigate("/scores?tab=Ladder");
    }
  }, [currentEvent]);
  if (!heistCategory) {
    return <></>;
  }

  const heistItemRaces = heistCategory.children.filter(
    (category) =>
      category.scoring_presets[0]?.scoring_method === ScoringMethod.RANKED_TIME,
  );

  const heistMultiItemRaces = heistCategory.children.filter(
    (category) => category.children.length > 0,
  );

  return (
    <>
      {rules ? (
        <div className="my-4 w-full rounded-box bg-base-200 md:p-8">
          <article className="prose max-w-4xl text-left">
            <HeistTabRules />
          </article>
        </div>
      ) : null}
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-8">
          <TeamScoreDisplay objective={heistCategory} />
          {heistItemRaces.map((category) => (
            <div key={category.id} className="rounded-box bg-base-200 p-8 pt-2">
              <div className="divider divider-primary">{category.name}</div>
              <Ranking
                objective={category}
                maximum={category.required_number}
                actual={(teamId: number) =>
                  category.team_score[teamId].number()
                }
                description={"Items:"}
              />
            </div>
          ))}

          {heistMultiItemRaces.map((category) => (
            <div key={category.id} className="rounded-box bg-base-200 p-8 pt-2">
              <div className="divider divider-primary">{category.name}</div>
              {(category.scoring_presets[0]?.scoring_method ===
                ScoringMethod.RANKED_TIME ||
                category.scoring_presets[0]?.scoring_method ===
                  ScoringMethod.RANKED_COMPLETION_TIME) && (
                <Ranking
                  objective={category}
                  maximum={category.children.length}
                  actual={(teamId: number) =>
                    category.children.filter((o) =>
                      o.team_score[teamId].isFinished(),
                    ).length
                  }
                  description={"Items:"}
                />
              )}
              <div className="flex flex-col">
                <ItemTable
                  objective={category}
                  styles={{
                    header: "bg-base-100",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
