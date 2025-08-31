import { JSX, useContext, useEffect } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import TeamScoreDisplay from "@components/team-score";
import { ItemTable } from "@components/item-table";
import { GameVersion, ScoringMethod } from "@client/api";
import { Ranking } from "@components/ranking";
import { createFileRoute } from "@tanstack/react-router";
import { HeistTabRules } from "@rules/heist";

export const Route = createFileRoute("/scores/heist")({
  component: HeistTab,
});

export function HeistTab(): JSX.Element {
  const { scores, currentEvent } = useContext(GlobalStateContext);
  const { rules } = Route.useSearch();
  const heistCategory = scores?.children.find(
    (category) => category.name === "Heist"
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
      category.scoring_preset?.scoring_method === ScoringMethod.RANKED_TIME
  );

  const heistMultiItemRaces = heistCategory.children.filter(
    (category) => category.children.length > 0
  );

  return (
    <>
      {rules ? (
        <div className="w-full bg-base-200 my-4 p-8 rounded-box">
          <article className="prose text-left max-w-4xl">
            <HeistTabRules />
          </article>
        </div>
      ) : null}
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-8">
          <TeamScoreDisplay objective={heistCategory} />
          {heistItemRaces.map((category) => (
            <div key={category.id} className="bg-base-200 rounded-box p-8 pt-2">
              <div className="divider divider-primary">{category.name}</div>
              <Ranking
                objective={category}
                maximum={category.required_number}
                actual={(teamId: number) =>
                  category.team_score[teamId]?.number || 0
                }
                description={"Items:"}
              />
            </div>
          ))}

          {heistMultiItemRaces.map((category) => (
            <div key={category.id} className="bg-base-200 rounded-box p-8 pt-2">
              <div className="divider divider-primary">{category.name}</div>
              {category.scoring_preset?.scoring_method ===
                ScoringMethod.RANKED_TIME && (
                <Ranking
                  objective={category}
                  maximum={category.required_number}
                  actual={(teamId: number) =>
                    category.team_score[teamId]?.number || 0
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
