import { Card, Divider, Progress, theme, Tooltip } from "antd";
import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { getSubCategory } from "../types/scoring-category";
import { Team } from "../types/team";
import { ScoreLite } from "../types/score";
import { red, green } from "@ant-design/colors";
import TeamScore from "../components/team-score";

const { useToken } = theme;

export function CollectionTab() {
  const { eventStatus, scores, currentEvent } = useContext(GlobalStateContext);
  const category = getSubCategory(scores, "Collections");
  const token = useToken().token;

  if (!category || !currentEvent) {
    return <></>;
  }
  const teamMap = currentEvent.teams.reduce(
    (acc: { [teamId: number]: Team }, team) => {
      acc[team.id] = team;
      return acc;
    },
    {}
  );

  return (
    <>
      <TeamScore category={category}></TeamScore>
      <Divider style={{ borderColor: token.colorPrimary }}>
        {`Collection Goals`}
      </Divider>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "8px",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        {category.objectives.map((objective) => (
          <Card
            key={objective.id}
            title={
              <Tooltip title={objective.extra}>
                <div
                  style={{
                    whiteSpace: "normal",
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  {`Collect ${objective.required_number} ${objective.name}`}
                  {objective.extra ? <a style={{ color: red[6] }}>*</a> : null}
                </div>
              </Tooltip>
            }
            size="small"
            styles={{
              body: {
                // so that the highlight color goes all the way to the edge
                paddingLeft: "0px",
                paddingRight: "0px",
              },
            }}
          >
            <table
              key={objective.id}
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: ".5rem",
                marginBottom: ".5rem",
              }}
            >
              <tbody>
                {Object.entries(objective.team_score)
                  .map(([teamId, score]) => {
                    return [parseInt(teamId), score] as [number, ScoreLite];
                  })
                  .sort(
                    ([, scoreA], [, scoreB]) => scoreB.number - scoreA.number
                  )
                  .map(([teamId, score]) => {
                    const percent =
                      (100 * score.number) / objective.required_number;
                    return (
                      <tr
                        key={teamId}
                        style={{
                          backgroundColor:
                            teamId === eventStatus?.team_id
                              ? token.colorBgSpotlight
                              : "transparent",
                          width: "2000px",
                        }}
                      >
                        <td
                          style={{
                            padding: "4px 8px",
                            fontWeight: "bold",
                            color: score.rank === 0 ? red[4] : green[4],
                          }}
                        >
                          {score.points}
                        </td>
                        <td
                          style={{
                            width: "50%",
                          }}
                        >
                          <Progress
                            percent={percent}
                            format={() => (
                              <>
                                {score.number}/{objective.required_number}
                              </>
                            )}
                          />
                        </td>
                        <td
                          style={{
                            padding: "4px 8px",
                            alignItems: "center",
                          }}
                        >
                          {teamMap[teamId]?.name}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </Card>
        ))}
      </div>
    </>
  );
}
