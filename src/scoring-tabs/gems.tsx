import { useContext, useEffect } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import TeamScore from "../components/team-score";
import { ItemTable } from "../components/item-table";
import { GameVersion } from "../client";
import { router } from "../router";

export const GemTab: React.FC = () => {
  const { currentEvent, scores, gameVersion } = useContext(GlobalStateContext);
  useEffect(() => {
    if (gameVersion !== GameVersion.poe1) {
      router.navigate("/scores?tab=Ladder");
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
      <ItemTable category={gemCategory} />
    </>
  );
};
