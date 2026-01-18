import { useContext } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import { Score } from "@client/api";
import {
  getPotentialPoints,
  getTotalPoints,
  isFinished,
  rank2text,
  totalPoints,
} from "@utils/utils";
// import { TeamLogo } from "./teamlogo";
import { useGetEventStatus } from "@client/query";
import { twMerge } from "tailwind-merge";
import { renderScore } from "@utils/score";
import { ScoreObjective } from "@mytypes/score";

interface RankingProps {
  objective: ScoreObjective;
  description: string;
  actual: (teamId: number) => number;
  maximum: number;
}

function getGridLayout(numTeams: number) {
  switch (numTeams) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-1 sm:grid-cols-2";
    case 3:
      return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
    case 4:
      return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4";
    default:
      return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4";
  }
}

function getCardColor(score: Score) {
  switch (score.completions[0]?.rank) {
    case 1:
      return "text-black/70 bg-gold-metallic";
    case 2:
      return "text-black/70 bg-silver-metallic";
    case 3:
      return "text-black/70 bg-bronze-metallic";
    default:
      return "";
  }
}

function sort(
  [teamId1, score1]: [string, Score],
  [teamId2, score2]: [string, Score],
) {
  if (score1.completions[0]?.rank !== score2.completions[0]?.rank) {
    if (score1.completions[0]?.rank === 0) return 1;
    if (score2.completions[0]?.rank === 0) return -1;
    return score1.completions[0]?.rank - score2.completions[0]?.rank;
  }
  if (totalPoints(score1) !== totalPoints(score2)) {
    return totalPoints(score2) - totalPoints(score1);
  }
  return score2.completions[0]?.number - score1.completions[0]?.number;
}

export function Ranking({
  objective,
  description,
  maximum,
  actual,
}: RankingProps) {
  const { currentEvent, preferences } = useContext(GlobalStateContext);
  const { eventStatus } = useGetEventStatus(currentEvent.id);
  const teamIds = currentEvent.teams
    .sort((a, b) => {
      if (a.id === eventStatus?.team_id) return -1;
      if (b.id === eventStatus?.team_id) return 1;
      const scoreA = objective.team_score[a.id];
      const scoreB = objective.team_score[b.id];
      const pointsA = scoreA ? totalPoints(scoreA) : -1;
      const pointsB = scoreB ? totalPoints(scoreB) : -1;
      if (pointsA === pointsB) {
        const numberA = scoreA ? scoreA.completions[0]?.number : -1;
        const numberB = scoreB ? scoreB.completions[0]?.number : -1;
        if (numberA === numberB) {
          return b.id - a.id;
        }
        return numberB - numberA;
      }

      return pointsB - pointsA;
    })
    .slice(0, preferences.limitTeams ? preferences.limitTeams : undefined)
    .map((team) => team.id);

  return (
    <div
      className={twMerge(
        "grid w-full gap-4",
        getGridLayout(Object.keys(teamIds).length),
      )}
    >
      {Object.entries(objective.team_score)
        .sort(sort)
        .filter(([teamId]) => teamIds.includes(parseInt(teamId)))
        .map(([teamIdstr, score]) => {
          const teamId = parseInt(teamIdstr);
          return (
            <div
              className={twMerge(
                "card bborder bg-card shadow-xl",
                getCardColor(score),
              )}
              key={"score-" + teamId}
            >
              <div className="card-body">
                <div className="flex flex-row items-center justify-between">
                  <div className="flex flex-col px-4">
                    <div className="card-title flex items-center text-2xl">
                      {
                        currentEvent?.teams?.find((team) => team.id === teamId)
                          ?.name
                      }
                    </div>
                    <div className="text-left text-lg font-semibold bg-blend-normal">
                      {description} {actual(teamId)} / {maximum}
                    </div>
                  </div>
                  <div className="">
                    {
                      <div className="text-lg font-semibold">
                        {rank2text(score.completions[0]?.rank)}
                      </div>
                    }
                    <div className="text-xl font-bold">
                      {renderScore(
                        getTotalPoints(objective)[teamId],
                        getPotentialPoints(objective)[teamId],
                      )}
                    </div>
                  </div>
                </div>
                {isFinished(score) ? null : (
                  <div className="text-left">
                    <progress
                      className="progress progress-primary"
                      value={actual(teamId)}
                      max={maximum}
                    ></progress>
                  </div>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
}
