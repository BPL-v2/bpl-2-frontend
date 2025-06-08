import { ScoreObjective } from "@mytypes/score";
import { useContext } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import { ProgressBar } from "./progress-bar";
import { Score } from "@client/api";
import { useGetEventStatus } from "@client/query";

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
  const { currentEvent } = useContext(GlobalStateContext);
  const { data: eventStatus } = useGetEventStatus(currentEvent.id);

  return (
    <table key={objective.id} className="w-full mt-2">
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
                  teamId === eventStatus?.team_id
                    ? "bg-highlight content-highlight"
                    : ""
                }
                key={teamId}
              >
                {showPoints ? (
                  <td className="py-1 px-2">
                    <div
                      className="tooltip"
                      data-tip={finishTooltip(objective, score)}
                    >
                      <div
                        className={`text-left px-2 ${
                          percent < 100 ? "text-error" : "text-success"
                        }`}
                      >
                        {score.points}
                      </div>
                    </div>
                  </td>
                ) : null}
                <td className="px-2">
                  <ProgressBar
                    style={{ width: "180px" }}
                    value={score.number}
                    maxVal={objective.required_number}
                  />
                </td>
                <td className="text-left px-2">
                  {currentEvent?.teams.find((team) => team.id === teamId)?.name}
                </td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
}
