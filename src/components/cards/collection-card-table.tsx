import { useGetEventStatus } from "@client/query";
import { ScoreClass, ScoreObjective } from "@mytypes/score";
import { GlobalStateContext } from "@utils/context-provider";
import { useContext, useRef } from "react";
import { twMerge } from "tailwind-merge";
import { ProgressBar } from "../progress-bar";

type CollectionCardTableProps = {
  objective: ScoreObjective;
  roundedBottom?: boolean;
  showPoints?: boolean;
};

function getPlace(score: ScoreClass) {
  const rank = score.rank();
  if (!rank) {
    return "Not Finished";
  }
  if (rank === 1) {
    return "First place";
  }
  if (rank === 2) {
    return "Second place";
  }
  if (rank === 3) {
    return "Third place";
  }
  return "Finished";
}

function finishTooltip(objective: ScoreObjective, score: ScoreClass) {
  const place = getPlace(score);
  return `${place} ${
    objective.scoring_presets.length > 0 &&
    `${score.totalPoints()}/${Math.max(...objective.scoring_presets[0].points)} points`
  }`;
}

export function CollectionCardTable({
  objective,
  roundedBottom = false,
  showPoints = true,
}: CollectionCardTableProps) {
  const { currentEvent, preferences } = useContext(GlobalStateContext);
  const { eventStatus } = useGetEventStatus(currentEvent.id);
  const tableRef = useRef<HTMLTableElement>(null);
  const teamIds = currentEvent.teams
    .sort((a, b) => {
      if (a.id === eventStatus?.team_id) return -1;
      if (b.id === eventStatus?.team_id) return 1;
      return (
        objective.team_score[b.id].totalPoints() -
        objective.team_score[a.id].totalPoints()
      );
    })
    .slice(0, preferences.limitTeams ? preferences.limitTeams : undefined)
    .map((team) => team.id);
  const longestTeamName = Math.max(
    ...currentEvent.teams
      .filter((team) => teamIds.includes(team.id))
      .map((team) => team.name.length),
  );
  const canGrantPoints =
    objective.scoring_presets.length > 0 &&
    objective.scoring_presets.some((preset) =>
      preset.points.some((point) => point > 0),
    );
  showPoints = showPoints && canGrantPoints;
  return (
    <table key={objective.id} ref={tableRef}>
      <tbody>
        {Object.entries(objective.team_score)
          .filter(([teamId]) => teamIds.includes(parseInt(teamId)))
          .map(([teamId, score]) => {
            return [parseInt(teamId), score] as [number, ScoreClass];
          })
          .sort(([, scoreA], [, scoreB]) => {
            if (scoreA.totalPoints() === scoreB.totalPoints()) {
              return scoreB.number() - scoreA.number();
            }
            return scoreB.totalPoints() - scoreA.totalPoints();
          })
          .map(([teamId, score], idx) => {
            const isFinished = score.number() / objective.required_number >= 1;
            const isLastRow = roundedBottom && idx === teamIds.length - 1;
            const isPlayerTeam = teamId === eventStatus?.team_id;
            const gotPoints = score.totalPoints() > 0;
            const isHidden =
              objective.hide_progress && !isFinished && !isPlayerTeam;
            return (
              <tr
                className={
                  isPlayerTeam ? "content-highlight bg-highlight/70" : ""
                }
                key={teamId}
              >
                {showPoints && (
                  <td
                    className={twMerge(
                      "px-2 py-1",
                      isLastRow && "rounded-bl-xl",
                    )}
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
                        {score.totalPoints()}
                      </div>
                    </div>
                  </td>
                )}

                <td
                  className={twMerge(
                    "w-full px-2 py-1",
                    isLastRow && !showPoints && "rounded-bl-xl",
                  )}
                >
                  {!isHidden ? (
                    <ProgressBar
                      value={score.number()}
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
