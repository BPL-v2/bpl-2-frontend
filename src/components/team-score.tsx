import { Card, theme, Typography } from "antd";
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
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
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
            styles={{
              body: {
                paddingLeft: "10px",
                paddingRight: "10px",
              },
            }}
          >
            {/* <Space direction={"horizontal"}>
              <img
                style={{
                  width: 120,
                  height: 120,
                }}
                src={`/assets/teams/${currentEvent.name
                  .toLowerCase()
                  .replaceAll(
                    " ",
                    "_"
                  )}/${team.name.toLowerCase()}/logo-w-name.svg`}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Typography.Text level={4}>{team.name}</Typography.Text>
                <Typography.Text>
                  {`Score: ${teamScores[team.id]} / ${
                    potentialScores[team.id]
                  }`}
                </Typography.Text>
              </div>
            </Space> */}

            <Meta
              avatar={
                !isMobile ? (
                  <div
                    style={{
                      width: 96,
                      height: 96,
                      display: "inline-flex",
                    }}
                  >
                    <img
                      src={`/assets/teams/${currentEvent.name
                        .toLowerCase()
                        .replaceAll(
                          " ",
                          "_"
                        )}/${team.name.toLowerCase()}/logo-w-name.svg`}
                    />
                  </div>
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
