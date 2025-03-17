import { ScoreCategory, ScoreObjective } from "../types/score";
import { getImageLocation } from "../types/scoring-objective";
import { GlobalStateContext } from "../utils/context-provider";
import { JSX, useContext, useEffect, useState } from "react";
import { ObjectiveIcon } from "./objective-icon";
import { GameVersion, Team } from "../client";

export type ItemTableProps = {
  category?: ScoreCategory;
};

export function ItemTable({ category }: ItemTableProps) {
  const { currentEvent, isMobile, gameVersion, eventStatus, users } =
    useContext(GlobalStateContext);
  const [nameFilter, setNameFilter] = useState<string | undefined>();
  const [completionFilter, setCompletionFilter] = useState<{
    [teamId: number]: number;
  }>({});
  const [showVariants, setShowVariants] = useState<{
    [objectiveName: string]: boolean;
  }>({});
  const [variantMap, setVariantMap] = useState<{
    [objectiveName: string]: ScoreObjective[];
  }>({});
  const userTeamID = eventStatus?.team_id || -1;

  useEffect(() => {
    if (!category) {
      return;
    }
    const map = category.sub_categories
      .filter((subCategory) => subCategory.name.includes("Variants"))
      .reduce((acc: { [name: string]: ScoreObjective[] }, subCategory) => {
        const name = subCategory.name.split("Variants")[0].trim();
        acc[name] = subCategory.objectives;
        return acc;
      }, {});
    setVariantMap(map);
    setShowVariants(
      category.objectives.reduce(
        (acc: { [objectiveName: string]: boolean }, objective) => {
          acc[objective.name] = false;
          return acc;
        },
        {}
      )
    );
  }, [category]);

  useEffect(() => {
    if (currentEvent) {
      setCompletionFilter(
        currentEvent.teams.reduce((acc: { [teamId: number]: number }, team) => {
          acc[team.id] = 0;
          return acc;
        }, {})
      );
    }
  }, [currentEvent]);

  if (!currentEvent || !category) {
    return <></>;
  }
  const rowFilter = (objective: ScoreObjective) => {
    if (
      nameFilter &&
      !objective.name.toLowerCase().includes(nameFilter.toLowerCase())
    ) {
      return false;
    }
    for (const teamId in completionFilter) {
      if (
        completionFilter[teamId] === 1 &&
        objective.team_score[teamId].finished
      ) {
        return false;
      }
      if (
        completionFilter[teamId] === 2 &&
        !objective.team_score[teamId].finished
      ) {
        return false;
      }
    }
    return true;
  };

  const objectNameRender = (objective: ScoreObjective) => {
    if (variantMap[objective.name]) {
      return (
        <div className="flex flex-col cursor-pointer ">
          <div>{objective.name}</div>
          <span className="text-sm text-primary">
            [Click to toggle Variants]
          </span>
        </div>
      );
    }
    if (objective.extra) {
      return (
        <div className="flex flex-col ">
          <div>{objective.name}</div>
          <span className="text-sm text-primary">{objective.extra}</span>
        </div>
      );
    }
    return <>{objective.name}</>;
  };

  const imageOverlayedWithText = (
    objective: ScoreObjective,
    gameVersion: GameVersion
  ) => {
    const img_location = getImageLocation(objective, gameVersion);
    if (!img_location) {
      return <></>;
    }
    return (
      <div className="relative flex items-center justify-center">
        <img src={img_location} className="max-w-20 max-h-20" />
        <div
          className="absolute  left-0 right-0 text-center text-lg"
          style={{
            textShadow: "2px 2px 4px rgba(0, 0, 0)", // Text shadow for better readability
          }}
        >
          {objectNameRender(objective)}
        </div>
      </div>
    );
  };

  const badgeClass = (objective: ScoreObjective, teamID: number) => {
    let className = "badge gap-2 w-full font-semibold py-3 ring-2";
    if (objective.team_score[teamID].finished) {
      className += " bg-success text-success-content";
    } else {
      className += " bg-error text-error-content";
    }
    if (teamID === userTeamID) {
      className += " ring-white ";
    }
    return className;
  };
  const teamSort = (a: Team, b: Team) => {
    if (a.id === userTeamID) {
      return -1;
    }
    if (b.id === userTeamID) {
      return 1;
    }
    return a.name.localeCompare(b.name);
  };

  const completionRows = (objective: ScoreObjective) => {
    return isMobile ? (
      <td
        key={`${category.id}-${objective.id}`}
        className="grid grid-cols-1 sm:grid-cols-2 gap-2 "
      >
        {currentEvent.teams.sort(teamSort).map((team) => (
          <div
            key={`badge-${category.id}-${team.id}-${objective.id}`}
            className={badgeClass(objective, team.id)}
          >
            {team.name}
          </div>
        ))}
      </td>
    ) : (
      currentEvent.teams.sort(teamSort).map((team) => {
        const finished = objective.team_score[team.id]?.finished || false;
        const user =
          finished &&
          users?.find((u) => objective.team_score[team.id]?.user_id === u.id);
        let entry: JSX.Element | string = "❌";
        if (user) {
          entry = (
            <div
              className="tooltip cursor-help tooltip-bottom"
              data-tip={`scored by ${user.display_name}`}
            >
              ✅
            </div>
          );
        } else if (finished) {
          entry = "✅";
        }
        return (
          <td
            key={category.id + "-" + objective.id + "-" + team.id}
            className={`text-center text-2xl`}
          >
            {entry}
          </td>
        );
      })
    );
  };
  return (
    <>
      <div className=" max-h-[70vh] overflow-auto">
        <table className="table bg-base-300 table-md">
          <thead className="bg-base-200 sticky top-0 z-10">
            <tr className="text-lg">
              {isMobile ? null : <th></th>}
              <th>
                {!isMobile && (
                  <input
                    type="text"
                    placeholder="Name"
                    className="input text-lg w-full max-w-xs focus:outline-0 focus:border-primary"
                    onChange={(e) => setNameFilter(e.target.value)}
                  />
                )}
              </th>
              {isMobile ? (
                <th className="text-center">Completion</th>
              ) : (
                currentEvent.teams.sort(teamSort).map((team) => (
                  <th
                    key={`${category.id}-${team.name}`}
                    className={
                      userTeamID === team.id
                        ? "bg-base-300/15 text-base-content"
                        : ""
                    }
                  >
                    <div className="flex flex-row items-center">
                      <div>
                        <p>{team.name}</p>
                        <p className="text-accent text-sm">
                          {category.objectives.reduce(
                            (acc: number, objective) =>
                              acc +
                              (objective.team_score[team.id]?.finished ? 1 : 0),
                            0
                          )}
                          / {category.objectives.length}
                        </p>
                      </div>
                      <button
                        className="btn w-8 h-8  bg-base-300 ml-2 select-none text-center align-middle border-1 border-primary/50"
                        onClick={(e) => {
                          setCompletionFilter({
                            ...completionFilter,
                            [team.id]: (completionFilter[team.id] + 1) % 3,
                          });
                          e.stopPropagation();
                        }}
                      >
                        {[null, "❌", "✅"][completionFilter[team.id]]}
                      </button>
                    </div>
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {category.objectives.filter(rowFilter).flatMap((objective) => {
              const objRow = (
                <tr
                  key={`${category.id}-${objective.id}`}
                  className={"hover:bg-base-200/50"}
                  onClick={() => {
                    if (!variantMap[objective.name]) {
                      return;
                    }
                    setShowVariants({
                      ...showVariants,
                      [objective.name]: !showVariants[objective.name],
                    });
                  }}
                >
                  {isMobile ? (
                    <td>{imageOverlayedWithText(objective, gameVersion)}</td>
                  ) : (
                    <>
                      <td>
                        <ObjectiveIcon
                          objective={objective}
                          gameVersion={currentEvent.game_version}
                        />
                      </td>
                      <td>{objectNameRender(objective)}</td>
                    </>
                  )}
                  {completionRows(objective)}
                </tr>
              );

              const variantRows = variantMap[objective.name]?.map((variant) => {
                return (
                  <tr
                    key={`${category.id}-${variant.id}`}
                    className="bg-base-200 hover:bg-base-100/50 m-0 p-0"
                  >
                    <>
                      {isMobile ? null : <td></td>}
                      <td
                        className={`text-primary ${
                          isMobile ? "text-center" : ""
                        }`}
                      >
                        {variant.extra}
                      </td>
                    </>
                    {completionRows(variant)}
                  </tr>
                );
              });
              const rows = [
                objRow,
                ...(showVariants[objective.name] ? variantRows : []),
              ];
              return rows;
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
