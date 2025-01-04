import { Avatar, Card, theme } from "antd";
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
  const { currentEvent, isMobile, eventStatus } =
    useContext(GlobalStateContext);
  const token = useToken().token;
  if (!currentEvent) {
    return <></>;
  }
  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "8px",
          marginTop: "20px",
          marginBottom: "20px",
        }}
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
              backgroundColor:
                team.id === eventStatus?.team_id ? token.colorBgSpotlight : "",
            }}
          >
            <Meta
              avatar={
                !isMobile ? (
                  <Avatar
                    size={96}
                    shape="square"
                    src={`/assets/teams/${
                      currentEvent.id
                    }/${team.name.toLowerCase()}/logo-w-name.svg`}
                  />
                ) : null
              }
              title={team.name}
              description={"Score: " + teamScores[team.id]}
            />
          </Card>
        ))}
      </div>
    </>
  );
};

export default TeamScore;
