import { Score } from "@client/api";
import { useGetEventStatus } from "@client/query";
import { ScoreObjective } from "@mytypes/score";
import { GlobalStateContext } from "@utils/context-provider";
import { useContext } from "react";
import { twMerge } from "tailwind-merge";
import { ProgressBar } from "./progress-bar";

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
  const place = getPlace(score);
  return `${place} ${
    objective.scoring_preset &&
    `${score.points}/${Math.max(...objective.scoring_preset!.points)} points`
  }`;
}

export function CollectionCardTable({
  objective,
  showPoints = true,
}: CollectionCardTableProps) {
  const { currentEvent, preferences } = useContext(GlobalStateContext);
  const { eventStatus } = useGetEventStatus(currentEvent.id);
  const teamIds = currentEvent.teams
    .sort((a, b) => {
      if (a.id === eventStatus?.team_id) return -1;
      if (b.id === eventStatus?.team_id) return 1;
      return (
        (objective.team_score[b.id]?.points || 0) -
        (objective.team_score[a.id]?.points || 0)
      );
    })
    .slice(0, preferences.limitTeams ? preferences.limitTeams : undefined)
    .map((team) => team.id);
  return (
    <table key={objective.id} className="w-full">
      <tbody className="bg-base-300">
        {Object.entries(objective.team_score)
          .filter(([teamId]) => teamIds.includes(parseInt(teamId)))
          .map(([teamId, score]) => {
            return [parseInt(teamId), score] as [number, Score];
          })
          .sort(([, scoreA], [, scoreB]) => {
            if (scoreA.points === scoreB.points) {
              return scoreB.number - scoreA.number;
            }
            return scoreB.points - scoreA.points;
          })
          .map(([teamId, score], idx) => {
            const percent = (100 * score.number) / objective.required_number;
            const isLastRow = idx === teamIds.length - 1;
            const isPlayerTeam = teamId === eventStatus?.team_id;

            return (
              <tr
                className={isPlayerTeam ? "bg-highlight content-highlight" : ""}
                key={teamId}
              >
                {showPoints ? (
                  <td
                    className={twMerge(
                      "py-1 px-2",
                      isLastRow && "rounded-bl-box"
                    )}
                  >
                    <div
                      className={twMerge(
                        "tooltip tooltip-right",
                        percent < 100 ? "tooltip-error" : "tooltip-success"
                      )}
                      data-tip={finishTooltip(objective, score)}
                    >
                      <div
                        className={twMerge(
                          "text-left px-2",
                          percent < 100 ? "text-error" : "text-success"
                        )}
                      >
                        {score.points}
                      </div>
                    </div>
                  </td>
                ) : null}
                <td
                  className={twMerge(
                    "px-2 w-full",
                    !showPoints && isLastRow && "rounded-bl-box"
                  )}
                >
                  <ProgressBar
                    value={score.number}
                    maxVal={objective.required_number}
                  />
                </td>
                <td
                  className={twMerge(
                    "text-left px-2",
                    isLastRow && "rounded-br-box"
                  )}
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
