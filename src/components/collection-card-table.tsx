import { ScoreObjective } from "../types/score";
import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { ProgressBar } from "./progress-bar";
import { Score } from "../client";

type CollectionCardTableProps = {
  objective: ScoreObjective;
  showPoints?: boolean;
};

function getPlace(score: Score) {
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

function finishTooltip(objective: ScoreObjective, score: Score) {
  let place = getPlace(score);
  return `${place} ${
    objective.scoring_preset
      ? `${score.points}/${Math.max(
          ...objective.scoring_preset!.points
        )} points`
      : ""
  }`;
}

export function CollectionCardTable({
  objective,
  showPoints = true,
}: CollectionCardTableProps) {
  const { eventStatus, currentEvent } = useContext(GlobalStateContext);

  return (
    <table key={objective.id} className="w-full">
      <tbody className="bg-base-300">
        {Object.entries(objective.team_score)
          .map(([teamId, score]) => {
            return [parseInt(teamId), score] as [number, Score];
          })
          .sort(([, scoreA], [, scoreB]) => {
            if (scoreA.points === scoreB.points) {
              return scoreB.number - scoreA.number;
            }
            return scoreB.points - scoreA.points;
          })
          .map(([teamId, score]) => {
            const percent = (100 * score.number) / objective.required_number;
            return (
              <tr
                className={
                  "px-4 " +
                  (teamId === eventStatus?.team_id
                    ? "bg-highlight content-highlight"
                    : "")
                }
                key={teamId}
              >
                {showPoints ? (
                  <td>
                    <div
                      className="tooltip"
                      data-tip={finishTooltip(objective, score)}
                    >
                      <div
                        className={`pt-1 pb-1 pl-2 pr-2 text-left ${
                          percent < 100 ? "text-error" : "text-success"
                        }`}
                      >
                        {score.points}
                      </div>
                    </div>
                  </td>
                ) : null}
                <td className="pl-4">
                  <ProgressBar
                    style={{ width: "180px" }}
                    value={score.number}
                    maxVal={objective.required_number}
                  />
                </td>
                <td className="text-left">
                  {currentEvent?.teams.find((team) => team.id === teamId)?.name}
                </td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
}
