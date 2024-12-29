import { useState } from "react";
import { Avatar, Card, Flex } from "antd";
import Meta from "antd/es/card/Meta";
import { Team } from "../types/team";

type score = {
  team: Team;
  score: number;
};

export type TeamScoreProps = {
  teamScores: score[];
  initialTeam?: number;
};

const TeamScore = ({ teamScores, initialTeam }: TeamScoreProps) => {
  //   const { user, rules } = useContext(GlobalStateContext);
  const [selectedTeam, setSelectedTeam] = useState<number | undefined>(
    initialTeam
  );

  return (
    <Flex
      wrap
      gap="small"
      justify="center"
      style={{ padding: 16, width: "100%", userSelect: "none" }}
    >
      {teamScores.map((teamScore) => (
        <Card
          key={teamScore.team.id}
          hoverable
          onClick={() => {
            setSelectedTeam(teamScore.team.id);
          }}
          style={{
            borderColor: selectedTeam === teamScore.team.id ? "teal" : "",
            borderWidth: 2,
            flex: "1 1 0", // Allow the card to take an equal share of the available width
            // margin: "px", // Add some margin for spacing between cards
          }}
        >
          <Meta
            avatar={
              <Avatar
                size={64}
                shape="square"
                src={`/assets/icons/${teamScore.team.name}.svg`}
              />
            }
            title={teamScore.team.name}
            description={"Score: " + teamScore.score}
          />
        </Card>
      ))}
    </Flex>
  );
};

export default TeamScore;
