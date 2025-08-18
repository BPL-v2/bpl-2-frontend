import { getImageLocation } from "@mytypes/scoring-objective";
import { GlobalStateContext } from "@utils/context-provider";
import { useContext, useEffect, useMemo, useState } from "react";
import { ObjectiveIcon } from "./objective-icon";
import { GameVersion, Team } from "@client/api";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import Table from "./table";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/16/solid";
import { ScoreObjective } from "@mytypes/score";
import {
  ExtendedScoreObjective,
  flatMapUniques,
  getVariantMap,
} from "@utils/utils";
import { useGetEventStatus, useGetUsers } from "@client/query";

export type ItemTableProps = {
  objective: ScoreObjective;
  filter?: (obj: ScoreObjective) => boolean;
  className?: string;
  styles?: {
    header?: string;
    body?: string;
    table?: string;
  };
};

export function ItemTable({
  objective,
  filter,
  className,
  styles,
}: ItemTableProps) {
  const { currentEvent, preferences } = useContext(GlobalStateContext);
  const { users } = useGetUsers(currentEvent.id);
  const { eventStatus } = useGetEventStatus(currentEvent.id);
  const [showVariants, setShowVariants] = useState<{
    [objectiveName: string]: boolean;
  }>({});
  const [variantMap, setVariantMap] = useState<{
    [objectiveName: string]: ScoreObjective[];
  }>({});
  const userTeamID = eventStatus?.team_id || -1;
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
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

  useEffect(() => {
    const variantMap = getVariantMap(objective);
    setVariantMap(variantMap);
    setShowVariants(
      Object.keys(variantMap).reduce(
        (acc: { [objectiveName: string]: boolean }, objectiveName) => {
          acc[objectiveName] = false;
          return acc;
        },
        {}
      )
    );
  }, [objective]);

  const objectNameRender = (objective: ExtendedScoreObjective) => {
    if (variantMap[objective.name] && !objective.isVariant) {
      return (
        <div
          className="flex flex-col cursor-pointer w-full"
          onClick={() =>
            setShowVariants({
              ...showVariants,
              [objective.name]: !showVariants[objective.name],
            })
          }
        >
          <div>{objective.name}</div>
          <span className="text-sm text-primary">
            [Click to toggle Variants]
          </span>
        </div>
      );
    }
    if (objective.isVariant) {
      return <span className="text-primary">{objective.extra}</span>;
    }
    if (objective.extra) {
      return (
        <div className="flex flex-col">
          <div>{objective.name}</div>
          <span className="text-sm text-primary">[{objective.extra}]</span>
        </div>
      );
    }
    return <>{objective.name}</>;
  };

  const imageOverlayedWithText = (
    objective: ExtendedScoreObjective,
    gameVersion: GameVersion
  ) => {
    if (objective.isVariant) {
      return <span className="text-primary">{objective.extra}</span>;
    }

    const img_location = getImageLocation(objective, gameVersion);
    if (!img_location) {
      return <></>;
    }
    return (
      <div className="relative flex items-center justify-center">
        <img
          src={img_location}
          className="max-w-20 max-h-20 sm:max-w-16 sm:max-h-16"
        />
        <div
          className="absolute left-0 right-0 text-center text-lg"
          style={{
            textShadow: "2px 2px 4px rgba(0, 0, 0)", // Text shadow for better readability
          }}
        >
          {objectNameRender(objective)}
        </div>
      </div>
    );
  };

  const badgeClass = (objective: ExtendedScoreObjective, teamID: number) => {
    let className = "badge gap-2 w-full font-semibold py-3 ring-2";
    if (objective.team_score[teamID]?.finished) {
      className += " bg-success text-success-content";
    } else {
      className += " bg-error text-error-content";
    }
    if (teamID === userTeamID) {
      className += " ring-white ";
    }
    return className;
  };

  const columns = useMemo<ColumnDef<ExtendedScoreObjective, any>[]>(() => {
    const teams = currentEvent.teams.sort((a: Team, b: Team) => {
      if (a.id === userTeamID) {
        return -1;
      }
      if (b.id === userTeamID) {
        return 1;
      }
      return a.name.localeCompare(b.name);
    });
    let columns: ColumnDef<ExtendedScoreObjective, any>[] = [];
    if (windowWidth < 1200) {
      columns = [
        {
          accessorKey: "name",
          header: "Name",
          size: 200,
          enableSorting: false,
          cell: (info) => (
            <div className="w-full">
              {imageOverlayedWithText(
                info.row.original,
                currentEvent.game_version
              )}
            </div>
          ),
        },
        {
          header: "Completion",
          size: windowWidth - 200,
          cell: (info) => (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-2">
              {teams.map((team) => (
                <div
                  key={`badge-${objective.id}-${team.id}-${info.row.original.id}`}
                  className={badgeClass(info.row.original, team.id)}
                >
                  {team.name}
                </div>
              ))}
            </div>
          ),
        },
      ];
    } else {
      columns = [
        {
          accessorKey: "icon",
          header: "",
          cell: (info: CellContext<ExtendedScoreObjective, string>) =>
            info.row.original.isVariant ? null : (
              <div className="w-full">
                <ObjectiveIcon
                  objective={info.row.original}
                  gameVersion={currentEvent.game_version}
                />
              </div>
            ),
          enableSorting: false,
          enableColumnFilter: false,
          size: 100,
        },
        {
          accessorKey: "name",
          header: "",
          enableSorting: false,
          size: Math.min(windowWidth, 1440) - 200 - teamIds.length * 200, // take up remaining space
          cell: (info: CellContext<ExtendedScoreObjective, string>) => {
            return objectNameRender(info.row.original);
          },
          filterFn: "includesString",
          meta: {
            filterVariant: "string",
            filterPlaceholder: "Name",
          },
        },
        ...teams
          .filter((team) => teamIds.includes(team.id))
          .map((team) => ({
            accessorKey: `team_score.${team.id}.finished`,
            header: () => {
              const objectives = flatMapUniques(objective);
              return (
                <div>
                  <div>{team.name || "Team"}</div>
                  <div className="text-sm text-info">
                    {objectives
                      .filter((o) => (filter ? filter(o) : true))
                      .filter((o) => o.team_score[team.id]?.finished)?.length ||
                      0}{" "}
                    /{" "}
                    {
                      objectives.filter((o) => (filter ? filter(o) : true))
                        .length
                    }
                  </div>
                </div>
              );
            },
            enableSorting: false,
            size: 200,
            cell: (info: CellContext<ExtendedScoreObjective, string>) => {
              const finished =
                info.row.original.team_score[team.id]?.finished || false;
              const user =
                finished &&
                users?.find(
                  (u) => info.row.original.team_score[team.id]?.user_id === u.id
                );
              if (user) {
                return (
                  <div
                    // className="tooltip cursor-help tooltip-bottom z-1000 flex justify-center w-full"
                    className="flex justify-center w-full"
                    // data-tip={`scored by ${user.display_name}`}
                  >
                    <CheckCircleIcon className="h-6 w-6 text-success" />
                  </div>
                );
              } else if (finished) {
                return (
                  <div className="flex justify-center w-full">
                    <CheckCircleIcon className="h-6 w-6 text-success" />{" "}
                  </div>
                );
              }
              return (
                <div className="flex justify-center w-full">
                  <XCircleIcon className="h-6 w-6 text-error" />{" "}
                </div>
              );
            },
            meta: {
              filterVariant: "boolean",
            },
          })),
      ];
    }
    return columns;
  }, [
    currentEvent,
    objective,
    variantMap,
    showVariants,
    windowWidth,
    badgeClass,
    imageOverlayedWithText,
    objectNameRender,
    userTeamID,
    users,
    filter,
  ]);

  if (!currentEvent || !objective) {
    return <></>;
  }

  return (
    <>
      <Table
        columns={columns}
        data={
          objective.children
            .filter((obj) => (filter ? filter(obj) : true))
            .sort((a, b) => a.name.localeCompare(b.name))
            .flatMap((objective) => {
              const variantRows = variantMap[objective.name]?.map((variant) => {
                return { ...variant, isVariant: true };
              });
              return [
                objective,
                ...(showVariants[objective.name] ? variantRows : []),
              ];
            }) as ExtendedScoreObjective[]
        }
        rowClassName={(row) =>
          "hover:bg-base-200/50 " +
          (row.original.isVariant ? "bg-base-200" : "")
        }
        className={className ? className : `w-full h-[70vh]`}
        styles={styles}
      />
    </>
  );
}
