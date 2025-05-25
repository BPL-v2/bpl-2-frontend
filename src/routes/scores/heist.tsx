import { useContext, useEffect } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import TeamScoreDisplay from "@components/team-score";
import { ItemTable } from "@components/item-table";
import { GameVersion } from "@client/api";
import { Ranking } from "@components/ranking";
import { createFileRoute } from "@tanstack/react-router";
import { ruleWrapper } from "./route";
import { HeistTabRules } from "@rules/heist";

export const Route = createFileRoute("/scores/heist")({
  component: () => ruleWrapper(<HeistTab />, <HeistTabRules />),
});

export function HeistTab() {
  const { scores, gameVersion } = useContext(GlobalStateContext);
  const heistCategory = scores?.children.find(
    (category) => category.name === "Heist"
  );
  useEffect(() => {
    if (gameVersion !== GameVersion.poe1) {
      // router.navigate("/scores?tab=Ladder");
    }
  }, [gameVersion]);
  if (!heistCategory) {
    return <></>;
  }

  const rogueGearCategory = heistCategory.children.find(
    (category) => category.name === "Rogue Gear"
  );
  const experimentalBasesCategory = heistCategory.children.find(
    (category) => category.name === "Experimental Bases"
  );
  const heistUniquesCategory = heistCategory.children.find(
    (category) => category.name === "Blueprint Uniques"
  );
  const enchantingOrbObjective = heistCategory.children.find(
    (c) => c.name === "Enchanting Orb Race"
  );

  return (
    <>
      <TeamScoreDisplay objective={heistCategory} />
      {enchantingOrbObjective && (
        <div className="flex flex-col gap-4">
          <div className="divider divider-primary">Enchanting Orb Race</div>
          <Ranking
            objective={enchantingOrbObjective}
            maximum={enchantingOrbObjective.required_number}
            actual={(teamId: number) =>
              enchantingOrbObjective.team_score[teamId]?.number || 0
            }
            description="Orbs:"
          />
        </div>
      )}
      {rogueGearCategory && (
        <div className="flex flex-col gap-4">
          <div className="divider divider-primary">Rogue Gear Race</div>
          <Ranking
            objective={rogueGearCategory}
            maximum={rogueGearCategory.children.length}
            actual={(teamId: number) =>
              rogueGearCategory.children.filter(
                (o) => o.team_score[teamId]?.finished
              ).length
            }
            description="Gear:"
          />
          <ItemTable objective={rogueGearCategory} />
        </div>
      )}
      {experimentalBasesCategory && (
        <>
          <div className="divider divider-primary">Experimental Bases</div>
          <ItemTable objective={experimentalBasesCategory} />
        </>
      )}
      {heistUniquesCategory && (
        <>
          <div className="divider divider-primary">Heist Uniques</div>
          <ItemTable objective={heistUniquesCategory} />
        </>
      )}
    </>
  );
}
