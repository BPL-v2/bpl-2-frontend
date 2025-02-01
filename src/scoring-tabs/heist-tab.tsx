import { useContext, useEffect, useState } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { Divider } from "antd";
import TeamScore from "../components/team-score";
import { ItemTable } from "../components/item-table";

export const HeistTab: React.FC = () => {
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
  const heistCategory = scores.sub_categories.find(
    (category) => category.name === "Heist"
  );

  if (!heistCategory) {
    return <></>;
  }
  return (
    <>
      <TeamScore
        category={heistCategory}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
      />
      {heistCategory.sub_categories.map((category) => {
        return (
          <>
            <Divider>{category.name}</Divider>
            <ItemTable category={category} selectedTeam={selectedTeam} />
          </>
        );
      })}
    </>
  );
};
