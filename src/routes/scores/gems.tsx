import { useContext, useEffect } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import TeamScore from "@components/team-score";
import { ItemTable } from "@components/item-table";
import { GameVersion } from "@client/api";
import { createFileRoute } from "@tanstack/react-router";
import { ruleWrapper } from "./route";
import { Ranking } from "@components/ranking";
import { GemTabRules } from "@rules/gems";

export const Route = createFileRoute("/scores/gems")({
  component: () => ruleWrapper(<GemTab />, <GemTabRules />),
});

export function GemTab() {
  const { currentEvent, scores, gameVersion } = useContext(GlobalStateContext);
  useEffect(() => {
    if (gameVersion !== GameVersion.poe1) {
      // router.navigate("/scores?tab=Ladder");
    }
  }, [gameVersion]);
  if (!currentEvent || !scores) {
    return <></>;
  }
  const gemCategory = scores.sub_categories.find(
    (category) => category.name === "Gems"
  );

  if (!gemCategory) {
    return <></>;
  }
  return (
    <>
      <TeamScore category={gemCategory} />
      <div className="divider divider-primary">{gemCategory.name}</div>
      <div className="flex flex-col gap-4">
        <Ranking
          objective={gemCategory}
          maximum={gemCategory.objectives.length}
          actual={(teamId: number) =>
            gemCategory.objectives.filter((o) => o.team_score[teamId]?.finished)
              .length
          }
          description="Gems:"
        />
        <ItemTable category={gemCategory} />
      </div>
    </>
  );
}
