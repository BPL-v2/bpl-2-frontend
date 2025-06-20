import { useContext } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import { Score } from "@client/api";
import { rank2text } from "@utils/utils";

interface RankingProps {
  objective: { team_score: Record<string, Score> };
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
  switch (score.rank) {
    case 1:
      return "text-black/70 bg-gold-metallic";
    case 2:
      return "text-black/70 bg-silver-metallic";
    case 3:
      return "text-black/70 bg-bronze-metallic";
    default:
      return "bg-base-300";
  }
}

function sort(
  [teamId1, score1]: [string, Score],
  [teamId2, score2]: [string, Score]
) {
  if (score1.rank === score2.rank) {
    return teamId1.localeCompare(teamId2);
  }

  if (score1.rank === 0) {
    return 1;
  }
  if (score2.rank === 0) {
    return -1;
  }
  return score1.rank - score2.rank;
}

export function Ranking({
  objective,
  description,
  maximum,
  actual,
}: RankingProps) {
  const { currentEvent } = useContext(GlobalStateContext);
  return (
    <div
      className={`w-full grid gap-4 ${getGridLayout(
        Object.keys(objective.team_score).length
      )}`}
    >
      {Object.entries(objective.team_score)
        .sort(sort)
        .map(([teamIdstr, score]) => {
          const teamId = parseInt(teamIdstr);
          const team = currentEvent?.teams?.find((t) => t.id === teamId);
          return (
            <div
              className={"card " + getCardColor(score)}
              key={"score-" + teamId}
            >
              <div className="card-body">
                <div className="flex flex-row items-center justify-between ">
                  <div className="stat-figure text-secondary row-span-2 hidden 2xl:block">
                    <div className="avatar online">
                      <div className="w-20">
                        <img
                          src={`/assets/teams/${
                            currentEvent?.id
                          }/${team?.name.toLowerCase()}/logo-w-name.png`}
                        ></img>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col px-4">
                    <div className="card-title flex items-center text-2xl ">
                      {
                        currentEvent?.teams?.find((team) => team.id === teamId)
                          ?.name
                      }
                    </div>
                    <div className="text-left text-lg bg-blend-normal font-extrabold">
                      {description} {actual(teamId)} / {maximum}
                    </div>
                  </div>
                  <div className="px-4">
                    {
                      <div className="text-lg font-semibold">
                        {rank2text(score.rank)}
                      </div>
                    }
                    <div className="text-xl font-bold">{score.points} pts</div>
                  </div>
                </div>
                {score.finished ? null : (
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
