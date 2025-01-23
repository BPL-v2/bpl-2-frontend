import { Progress, Statistic, theme, Tooltip } from "antd";
import { ScoreLite, ScoreObjective } from "../types/score";
import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { green, red } from "@ant-design/colors";

type CollectionCardTableProps = {
  objective: ScoreObjective;
};
const { useToken } = theme;

function getPlace(score: ScoreLite) {
  if (score.rank === 0) {
    return "Not Finished";
  }
  if (score.rank === 1) {
    return "First place";
  }
  if (score.rank === 2) {
    return "Second place";
  }
  if (score.rank === 3) {
    return "Third place";
  }
  return "Finished";
}

function finishTooltip(objective: ScoreObjective, score: ScoreLite) {
  let place = getPlace(score);
  return `${place} ${
    objective.scoring_preset
      ? `${score.points}/${Math.max(
          ...objective.scoring_preset!.points
        )} points`
      : ""
  }`;
}

export function CollectionCardTable({ objective }: CollectionCardTableProps) {
  const { eventStatus, currentEvent } = useContext(GlobalStateContext);
  const token = useToken().token;

  return (
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
          .sort(([, scoreA], [, scoreB]) => scoreB.number - scoreA.number)
          .map(([teamId, score]) => {
            const percent = (100 * score.number) / objective.required_number;
            return (
              <tr
                key={teamId}
                style={{
                  backgroundColor:
                    teamId === eventStatus?.team_id
                      ? token.colorBgSpotlight
                      : "transparent",
                }}
              >
                <td
                  style={{
                    paddingTop: "4px",
                    paddingBottom: "4px",
                    paddingRight: "8px",
                    paddingLeft: "8px",
                    color: score.rank === 0 ? red[4] : green[4],
                  }}
                >
                  <Tooltip title={finishTooltip(objective, score)}>
                    <Statistic
                      valueStyle={{
                        fontSize: "1em",
                        color: percent >= 100 ? green[4] : red[4],
                      }}
                      value={score.points}
                      // suffix={"pt."}
                    />
                  </Tooltip>
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
                    paddingTop: "4px",
                    paddingBottom: "4px",
                    paddingRight: "16px",
                    paddingLeft: "8px",
                    alignItems: "center",
                  }}
                >
                  {currentEvent?.teams.find((team) => team.id === teamId)?.name}
                </td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
}
