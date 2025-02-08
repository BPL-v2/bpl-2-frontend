import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { ScoreCategory } from "../types/score";
import { getPotentialPoints, getTotalPoints } from "../utils/utils";

export type TeamScoreProps = {
  selectedTeam?: number;
  setSelectedTeam?: (teamId: number) => void;
  category: ScoreCategory;
};

const TeamScore = ({
  category,
  selectedTeam,
  setSelectedTeam,
}: TeamScoreProps) => {
  const teamScores = getTotalPoints(category);
  const potentialScores = getPotentialPoints(category);
  const { currentEvent, eventStatus } = useContext(GlobalStateContext);
  if (!currentEvent) {
    return <></>;
  }
  const interactive = selectedTeam ? "cursor-pointer hover:bg-base-200" : "";
  return (
    <>
      <div className={`grid grid-cols-2  gap-1 md:grid-cols-2 xl:grid-cols-4`}>
        {currentEvent.teams.map((team) => {
          const bgColor =
            team.id === eventStatus?.team_id ? "bg-highlight" : "bg-base-300";
          const borderColor =
            team.id === selectedTeam ? "border-primary" : "border-transparent";
          return (
            <div
              className={`card border-4 rounded-none ${bgColor} ${borderColor} ${interactive}`}
              key={team.id}
              onClick={() =>
                setSelectedTeam ? setSelectedTeam(team.id) : null
              }
            >
              <div className="stat px-0 md:px-4">
                <div className="col-start-1 font-bold text-xl md:text-2xl">
                  {team.name}
                </div>

                <div className="stat-figure text-secondary row-span-2 hidden md:block">
                  <div className="avatar online">
                    <div className="w-24">
                      <img
                        src={`/assets/teams/${currentEvent.name
                          .toLowerCase()
                          .replaceAll(
                            " ",
                            "_"
                          )}/${team.name.toLowerCase()}/logo-w-name.svg`}
                      ></img>
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
                    src={`/assets/teams/${currentEvent.name
                      .toLowerCase()
                      .replaceAll(
                        " ",
                        "_"
                      )}/${team.name.toLowerCase()}/logo-w-name.svg`}
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

export default TeamScore;
