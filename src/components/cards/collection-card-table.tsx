import { Score } from "@client/api";
import { useGetEventStatus } from "@client/query";
import { ScoreObjective } from "@mytypes/score";
import { GlobalStateContext } from "@utils/context-provider";
import { useContext, useRef } from "react";
import { twMerge } from "tailwind-merge";
import { ProgressBar } from "../progress-bar";

type CollectionCardTableProps = {
  objective: ScoreObjective;
  roundedBottom?: boolean;
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
  roundedBottom = false,
}: CollectionCardTableProps) {
  const { currentEvent, preferences } = useContext(GlobalStateContext);
  const { eventStatus } = useGetEventStatus(currentEvent.id);
  const tableRef = useRef<HTMLTableElement>(null);
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
  const longestTeamName = Math.max(
    ...currentEvent.teams
      .filter((team) => teamIds.includes(team.id))
      .map((team) => team.name.length),
  );
  return (
    <table key={objective.id} ref={tableRef}>
      <tbody>
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
            const isFinished = score.number / objective.required_number >= 1;
            const isLastRow = roundedBottom && idx === teamIds.length - 1;
            const isPlayerTeam = teamId === eventStatus?.team_id;
            const gotPoints = score.points > 0;
            const isHidden =
              objective.hide_progress &&
              !objective.team_score[teamId]?.finished;
            return (
              <tr
                className={
                  isPlayerTeam ? "content-highlight bg-highlight/70" : ""
                }
                key={teamId}
              >
                <td
                  className={twMerge("px-2 py-1", isLastRow && "rounded-bl-xl")}
                >
                  <div
                    className={twMerge(
                      "tooltip tooltip-right",
                      gotPoints
                        ? "tooltip-success"
                        : isFinished
                          ? "tooltip-warning"
                          : "tooltip-error",
                    )}
                    data-tip={finishTooltip(objective, score)}
                  >
                    <div
                      className={twMerge(
                        "px-2 text-left",
                        gotPoints
                          ? "text-success"
                          : isFinished
                            ? "text-warning"
                            : "text-error",
                      )}
                    >
                      {score.points}
                    </div>
                  </div>
                </td>

                <td className="w-full px-2">
                  {!isHidden ? (
                    <ProgressBar
                      value={score.number}
                      maxVal={objective.required_number}
                      gotPoints={gotPoints}
                    />
                  ) : (
                    "Hidden Progress"
                  )}
                </td>
                <td
                  className={twMerge(
                    "px-2 text-left",
                    isLastRow && "rounded-br-xl",
                  )}
                  style={{ minWidth: `${longestTeamName + 2}ch` }}
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
