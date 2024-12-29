import { useContext, useState } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { Avatar, Card, Flex } from "antd";
import Meta from "antd/es/card/Meta";
import TeamScore from "../components/teamscore";

const UniquePage: React.FC = () => {
  const { rules, currentEvent, eventStatus } = useContext(GlobalStateContext);
  const [selectedCategory, setSelectedCategory] = useState<number>(0);

  const uniqueCategory = rules?.sub_categories.find(
    (rule) => rule.name === "Uniques"
  );
  if (!uniqueCategory || !currentEvent) {
    return <></>;
  }
  const teamScores = currentEvent.teams.map((team) => {
    return {
      team: team,
      score: 1000,
    };
  });
  return (
    <>
      <TeamScore teamScores={teamScores} initialTeam={eventStatus?.team_id} />
      <Flex
        wrap
        gap="small"
        justify="center"
        style={{ padding: 16, userSelect: "none" }}
      >
        {uniqueCategory.sub_categories.map((category) => (
          <Card
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            hoverable
            style={{
              borderColor: selectedCategory === category.id ? "teal" : "",
              borderWidth: 2,
              width: 240,
            }}
          >
            <Meta
              avatar={
                <Avatar
                  size={64}
                  shape="square"
                  src={`/assets/icons/${category.name}.svg`}
                />
              }
              title={category.name}
              description={"? / " + category.objectives.length}
            />
          </Card>
        ))}
      </Flex>
    </>
  );
};

export default UniquePage;
