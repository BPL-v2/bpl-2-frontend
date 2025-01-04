import { Card, theme, Tooltip } from "antd";
import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { getSubCategory } from "../types/scoring-category";
import { Team } from "../types/team";
import { EllipsisOutlined } from "@ant-design/icons";
import { ScoreLite } from "../types/score";
import { red, green } from "@ant-design/colors";
import TeamScore from "./team-score";
import { getTotalPoints } from "../utils/utils";

export type SubmissionTabProps = {
  categoryName: string;
};
const { useToken } = theme;

export function SubmissionTab({ categoryName }: SubmissionTabProps) {
  const { eventStatus, scores, currentEvent } = useContext(GlobalStateContext);
  const category = getSubCategory(scores, categoryName);
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
      <TeamScore teamScores={getTotalPoints(category)}></TeamScore>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
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
                  {objective.name}
                  {objective.extra ? <a style={{ color: red[6] }}>*</a> : null}
                </div>
              </Tooltip>
            }
            extra={
              <>
                <EllipsisOutlined key="ellipsis" />
              </>
            }
            size="small"
            styles={{
              body: {
                padding: "0px",
              },
            }}
          >
            <table
              key={objective.id}
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: ".5rem",
              }}
            >
              <tbody>
                {Object.entries(objective.team_score)
                  .map(([teamId, score]) => {
                    return [parseInt(teamId), score] as [number, ScoreLite];
                  })
                  .sort(
                    ([, scoreA], [, scoreB]) => scoreB.points - scoreA.points
                  )
                  .map(([teamId, score]) => {
                    return (
                      <tr
                        key={teamId}
                        style={{
                          padding: "4px 8px",
                          backgroundColor:
                            teamId === eventStatus?.team_id
                              ? token.colorBgSpotlight
                              : "transparent",
                        }}
                      >
                        <td
                          style={{
                            padding: "4px 8px",
                            fontWeight: "bold",
                            color: score.rank === 0 ? red[4] : green[4],
                          }}
                        >
                          {score ? score.points : 0}
                        </td>
                        <td style={{}}>{teamMap[teamId]?.name}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </Card>
        ))}
        {/* </Flex> */}
      </div>
    </>
  );
}
