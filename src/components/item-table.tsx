import { ScoreCategory, ScoreObjective } from "@mytypes/score";
import { getImageLocation } from "@mytypes/scoring-objective";
import { GlobalStateContext } from "@utils/context-provider";
import { useContext, useEffect, useMemo, useState } from "react";
import { ObjectiveIcon } from "./objective-icon";
import { GameVersion, Team } from "@client/api";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import Table from "./table";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/16/solid";

export type ItemTableProps = {
  category: ScoreCategory;
};

export type ExtendedScoreObjective = ScoreObjective & {
  isVariant?: boolean;
};

export function ItemTable({ category }: ItemTableProps) {
  const { currentEvent, gameVersion, eventStatus, users } =
    useContext(GlobalStateContext);
  const [showVariants, setShowVariants] = useState<{
    [objectiveName: string]: boolean;
  }>({});
  const [variantMap, setVariantMap] = useState<{
    [objectiveName: string]: ExtendedScoreObjective[];
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

  useEffect(() => {
    const map = category.sub_categories
      .filter((subCategory) => subCategory.name.includes("Variants"))
      .reduce(
        (acc: { [name: string]: ExtendedScoreObjective[] }, subCategory) => {
          const name = subCategory.name.split("Variants")[0].trim();
          acc[name] = subCategory.objectives;
          return acc;
        },
        {}
      );
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

  if (!currentEvent || !category) {
    return <></>;
  }

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
  const teamSort = (a: Team, b: Team) => {
    if (a.id === userTeamID) {
      return -1;
    }
    if (b.id === userTeamID) {
      return 1;
    }
    return a.name.localeCompare(b.name);
  };

  const columns = useMemo<ColumnDef<ExtendedScoreObjective, any>[]>(() => {
    const teams = currentEvent.teams.sort(teamSort);
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
              {imageOverlayedWithText(info.row.original, gameVersion)}
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
                  key={`badge-${category.id}-${team.id}-${info.row.original.id}`}
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
          cell: (info: CellContext<ExtendedScoreObjective, any>) =>
            info.row.original.isVariant ? null : (
              <div className="w-full">
                <ObjectiveIcon
                  objective={info.row.original}
                  gameVersion={gameVersion}
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
          size: Math.min(windowWidth, 1440) - 200 - teams.length * 200, // take up remaining space
          cell: (info: CellContext<ExtendedScoreObjective, any>) => {
            return objectNameRender(info.row.original);
          },
          filterFn: "includesString",
          meta: {
            filterVariant: "string",
            filterPlaceholder: "Name",
          },
        },
        ...teams.map((team) => ({
          accessorKey: `team_score.${team.id}.finished`,
          header: () => (
            <div>
              <div>{team.name || "Team"}</div>
              <div className="text-sm text-info">
                {category.objectives.filter(
                  (o) => o.team_score[team.id]?.finished
                )?.length || 0}{" "}
                / {category.objectives.length}
              </div>
            </div>
          ),
          enableSorting: false,
          size: 200,
          cell: (info: CellContext<ExtendedScoreObjective, any>) => {
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
                  className="tooltip cursor-help tooltip-bottom z-1000 flex justify-center w-full"
                  data-tip={`scored by ${user.display_name}`}
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
  }, [currentEvent, category, variantMap, showVariants, windowWidth]);
  return (
    <>
      <Table
        columns={columns}
        data={
          category.objectives
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
        className="h-[70vh]"
      />
    </>
  );
}
