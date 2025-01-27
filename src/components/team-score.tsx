import { Avatar, Card, theme, Typography } from "antd";
import Meta from "antd/es/card/Meta";
import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { ScoreCategory } from "../types/score";
import { getPotentialPoints, getTotalPoints } from "../utils/utils";

export type TeamScoreProps = {
  selectedTeam?: number;
  setSelectedTeam?: (teamId: number) => void;
  category: ScoreCategory;
};
const { useToken } = theme;

const TeamScore = ({
  category,
  selectedTeam,
  setSelectedTeam,
}: TeamScoreProps) => {
  const teamScores = getTotalPoints(category);
  const potentialScores = getPotentialPoints(category);
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
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
              borderColor:
                selectedTeam === team.id ? token.colorPrimary : "transparent",
              borderWidth: 4,
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
                    src={`/assets/teams/${currentEvent.name
                      .toLowerCase()
                      .replaceAll(
                        " ",
                        "_"
                      )}/${team.name.toLowerCase()}/logo-w-name.svg`}
                  />
                ) : null
              }
              title={team.name}
              description={
                <Typography.Text style={{ fontSize: 20 }}>
                  {`Score: ${teamScores[team.id]} / ${
                    potentialScores[team.id]
                  }`}
                </Typography.Text>
              }
            />
          </Card>
        ))}
      </div>
    </>
  );
};

export default TeamScore;
