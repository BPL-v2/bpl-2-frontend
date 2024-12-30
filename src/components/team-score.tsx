import { Avatar, Card, Flex, theme } from "antd";
import Meta from "antd/es/card/Meta";
import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";

export type TeamScoreProps = {
  teamScores: { [teamId: number]: number };
  selectedTeam?: number;
  setSelectedTeam?: (teamId: number) => void;
};
const { useToken } = theme;

const TeamScore = ({
  teamScores,
  selectedTeam,
  setSelectedTeam,
}: TeamScoreProps) => {
  const { currentEvent } = useContext(GlobalStateContext);
  const token = useToken().token;
  if (!currentEvent) {
    return <></>;
  }
  return (
    <>
      <Flex
        wrap
        gap="small"
        justify="center"
        style={{ width: "100%", userSelect: "none", marginTop: 20 }}
      >
        {currentEvent.teams.map((team) => (
          <Card
            key={team.id}
            hoverable
            onClick={() => (setSelectedTeam ? setSelectedTeam(team.id) : null)}
            style={{
              borderColor: selectedTeam === team.id ? token.colorPrimary : "",
              borderWidth: 2,
              flex: "1 1 0",
            }}
          >
            <Meta
              avatar={
                <Avatar
                  size={96}
                  shape="square"
                  src={`/assets/teams/${
                    currentEvent.id
                  }/${team.name.toLowerCase()}/logo-w-name.svg`}
                />
              }
              title={team.name}
              description={"Score: " + teamScores[team.id]}
            />
          </Card>
        ))}
      </Flex>
    </>
  );
};

export default TeamScore;
