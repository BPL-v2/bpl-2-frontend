import { useContext } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import { getPotentialPoints, getTotalPoints } from "@utils/utils";
import { TeamName } from "./team-name";
import { ScoreObjective } from "@mytypes/score";
import { useGetEventStatus } from "@client/query";
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
  if (!objective) {
    return <></>;
  }

  const { currentEvent } = useContext(GlobalStateContext);
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
  const interactive = selectedTeam ? "cursor-pointer hover:bg-base-200" : "";
  return (
    <>
      <div
        className={`grid grid-cols-3 md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-1 md:gap-2 px-1 2xl:px-0`}
      >
        {currentEvent.teams.map((team) => {
          const bgColor =
            team.id === eventStatus?.team_id
              ? "bg-highlight content-highlight"
              : "bg-base-300";
          const borderColor =
            team.id === selectedTeam ? "border-primary" : "border-transparent";
          return (
            <div
              className={`flex rounded-box border-4 p-0 ${bgColor} ${borderColor} ${interactive}`}
              key={team.id}
              onClick={() =>
                setSelectedTeam ? setSelectedTeam(team.id) : null
              }
            >
              <div className="stat p-1 md:p-4">
                <div className="col-start-1 font-bold text-xl md:text-2xl">
                  <TeamName team={team} />
                </div>

                <div className="stat-figure text-secondary row-span-2 hidden md:block">
                  <div className="avatar online">
                    <div className="w-24">
                      <TeamLogo team={team} eventId={currentEvent.id} />
                    </div>
                  </div>
                </div>
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
