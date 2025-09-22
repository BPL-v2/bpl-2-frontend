import { useGetEventStatus } from "@client/query";
import { ScoreObjective } from "@mytypes/score";
import { GlobalStateContext } from "@utils/context-provider";
import { getPotentialPoints, getTotalPoints } from "@utils/utils";
import { useContext } from "react";
import { twMerge } from "tailwind-merge";
import { TeamName } from "./team-name";
import { TeamLogo } from "./teamlogo";

export type TeamScoreProps = {
  selectedTeam?: number;
  setSelectedTeam?: (teamId: number) => void;
  objective?: ScoreObjective;
};

const TeamScoreDisplay = ({
  objective,
  selectedTeam,
  setSelectedTeam,
}: TeamScoreProps) => {
  const { currentEvent, preferences } = useContext(GlobalStateContext);
  const nullScore = currentEvent.teams.reduce(
    (acc, team) => {
      acc[team.id] = 0;
      return acc;
    },
    {} as { [teamId: number]: number }
  );
  const { eventStatus } = useGetEventStatus(currentEvent.id);
  const teamScores = objective ? getTotalPoints(objective) : nullScore;
  const potentialScores = objective ? getPotentialPoints(objective) : nullScore;
  if (!currentEvent || !currentEvent.teams) {
    return <></>;
  }
  return (
    <>
      <div
        className={
          "grid grid-cols-3 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-1 md:gap-2 px-1 2xl:px-0"
        }
      >
        {currentEvent.teams
          .sort((a, b) => b.id - a.id)
          .slice(0, preferences.limitTeams ? preferences.limitTeams : undefined)
          .map((team) => {
            return (
              <div
                className={twMerge(
                  "flex rounded-box p-0 outline-2 bborder",
                  team.id === eventStatus?.team_id
                    ? "bg-highlight content-highlight"
                    : "bg-base-300",
                  team.id === selectedTeam
                    ? "outline-primary border-transparent"
                    : "outline-transparent",
                  selectedTeam && "cursor-pointer hover:bg-base-200"
                )}
                key={team.id}
                onClick={() =>
                  setSelectedTeam ? setSelectedTeam(team.id) : null
                }
              >
                <div className="stat p-1 md:p-4">
                  <TeamName
                    team={team}
                    className="col-start-1 font-bold text-xl md:text-2xl"
                  />
                  <TeamLogo
                    team={team}
                    eventId={currentEvent.id}
                    className="stat-figure row-span-2 hidden md:flex h-24 w-24"
                  />
                  <div className="stat-value text-xl md:text-2xl whitespace-nowrap">
                    {teamScores[team.id]}
                    <span className="hidden md:inline">
                      {" "}
                      / {potentialScores[team.id]}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
};

export default TeamScoreDisplay;
