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
  objective: ScoreObjective;
};

const TeamScoreDisplay = ({
  objective,
  selectedTeam,
  setSelectedTeam,
}: TeamScoreProps) => {
  const teamScores = getTotalPoints(objective);
  const potentialScores = getPotentialPoints(objective);
  const { currentEvent } = useContext(GlobalStateContext);
  const { eventStatus } = useGetEventStatus(currentEvent.id);
  if (!currentEvent || !currentEvent.teams) {
    return <></>;
  }
  const interactive = selectedTeam ? "cursor-pointer hover:bg-base-200" : "";
  return (
    <>
      <div
        className={`grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2 px-1 2xl:px-0`}
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
              className={`card grow border-4  ${bgColor} ${borderColor} ${interactive}`}
              key={team.id}
              onClick={() =>
                setSelectedTeam ? setSelectedTeam(team.id) : null
              }
            >
              <div className="stat px-0 md:px-4">
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
                <div className="stat-value text-xl md:text-2xl">{`${
                  teamScores[team.id]
                } / ${potentialScores[team.id]}`}</div>
                {/* <div className="stat-desc text-secondary">desc</div> */}
              </div>

              {/* <div className="flex justify-center gap-4 m-4 ">
                <div className="avatar w-24 select-none">
                  <img
                    className=""
                        src={`/assets/teams/${
                          currentEvent.id
                        }/${team.name.toLowerCase()}/logo-w-name.png`}
                  ></img>
                </div>
                <div className="flex flex-col justify-center">
                  <h2 className="text-2xl font-bold">{team.name}</h2>
                  <p className="text-xl font-bold">
                    {`Score: ${teamScores[team.id]} / ${
                      potentialScores[team.id]
                    }`}
                  </p>
                </div>
              </div> */}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default TeamScoreDisplay;
