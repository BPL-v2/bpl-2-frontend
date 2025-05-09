import { useContext, useEffect } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import TeamScore from "@components/team-score";
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
  const heistCategory = scores?.sub_categories.find(
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

  const rogueGearCategory = heistCategory.sub_categories.find(
    (category) => category.name === "Rogue Gear"
  );
  const experimentalBasesCategory = heistCategory.sub_categories.find(
    (category) => category.name === "Experimental Bases"
  );
  const heistUniquesCategory = heistCategory.sub_categories.find(
    (category) => category.name === "Blueprint Uniques"
  );
  const enchantingOrbObjective = heistCategory.objectives.find(
    (c) => c.name === "Enchanting Orb Race"
  );

  return (
    <>
      <TeamScore category={heistCategory} />
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
          <div className="divider divider-primary">Rogue Gear</div>
          <Ranking
            objective={rogueGearCategory}
            maximum={rogueGearCategory.objectives.length}
            actual={(teamId: number) =>
              rogueGearCategory.objectives.filter(
                (o) => o.team_score[teamId]?.finished
              ).length
            }
            description="Gear:"
          />
          <ItemTable category={rogueGearCategory} />
        </div>
      )}
      {experimentalBasesCategory && (
        <>
          <div className="divider divider-primary">Experimental Bases</div>
          <ItemTable category={experimentalBasesCategory} />
        </>
      )}
      {heistUniquesCategory && (
        <>
          <div className="divider divider-primary">Heist Uniques</div>
          <ItemTable category={heistUniquesCategory} />
        </>
      )}
    </>
  );
}
