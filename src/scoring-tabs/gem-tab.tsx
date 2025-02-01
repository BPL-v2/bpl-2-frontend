import { useContext, useEffect, useState } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { Divider } from "antd";
import TeamScore from "../components/team-score";
import { ItemTable } from "../components/item-table";

export const GemTab: React.FC = () => {
  const { currentEvent, eventStatus, scores } = useContext(GlobalStateContext);
  const [selectedTeam, setSelectedTeam] = useState<number | undefined>();
  useEffect(() => {
    if (eventStatus) {
      setSelectedTeam(eventStatus.team_id);
    }
  }, [eventStatus]);
  if (!currentEvent || !scores) {
    return <></>;
  }
  const gemCategory = scores.sub_categories.find(
    (category) => category.name === "Transfigured Gems"
  );

  if (!gemCategory) {
    return <></>;
  }
  return (
    <>
      <TeamScore
        category={gemCategory}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
      />
      <Divider>{gemCategory.name}</Divider>
      <ItemTable category={gemCategory} selectedTeam={selectedTeam} />
    </>
  );
};
