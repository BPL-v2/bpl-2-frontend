import { ObjectiveType, Score, Team } from "@client/api";
import { ObjectiveIcon } from "@components/objective-icon";
import Table from "@components/table";
import { TeamName } from "@components/team-name";
import { CategoryIcon, iconMap } from "@icons/category-icons";
import { ScoreObjective } from "@mytypes/score";
import { createFileRoute } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { GlobalStateContext } from "@utils/context-provider";
import { flatMap, timeSort } from "@utils/utils";
import { useContext, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getDeltaTimeBetween } from "@utils/time";
dayjs.extend(relativeTime);

export const Route = createFileRoute("/scores/progress")({
  component: RouteComponent,
});

type ScoreRow = {
  team: Team | undefined;
  objective: ScoreObjective;
} & Score;

function RouteComponent() {
  const { currentEvent, scores } = useContext(GlobalStateContext);
  const [timeFormat, setTimeFormat] = useState<"relative" | "absolute">(
    "absolute"
  );
  const [onlyShowRanked, setOnlyShowRanked] = useState(false);
  const teamMap = currentEvent.teams.reduce(
    (acc, team) => {
      acc[team.id] = team;
      return acc;
    },
    {} as Record<number, Team | undefined>
  );
  const uniqueCategories =
    scores?.children
      .find((c) => c.name == "Uniques")
      ?.children?.reduce(
        (acc, curr) => {
          acc[curr.id] = curr;
          return acc;
        },
        {} as Record<number, ScoreObjective>
      ) || {};

  const childIdToUniqueCategory = Object.entries(uniqueCategories).reduce(
    (acc, [id, category]) => {
      category.children?.forEach((child) => {
        child.children.forEach((grandChild) => {
          acc[grandChild.id] = category;
        });
        acc[child.id] = category;
      });
      return acc;
    },
    {} as Record<number, ScoreObjective>
  );
  const flatScores = flatMap(scores);

  const childIdToParentCategory = flatScores.reduce(
    (acc, score) => {
      for (const child of score.children) {
        acc[child.id] = score;
      }
      return acc;
    },
    {} as Record<number, ScoreObjective>
  );

  const scoreRows: ScoreRow[] = flatScores
    .flatMap((s) =>
      Object.entries(s.team_score).map(([teamId, score]) => ({
        objective: s,
        team: teamMap[parseInt(teamId)],
        ...score,
      }))
    )
    .filter((s) => s.finished && s.points > 0)
    .sort(timeSort<Score, "timestamp">("timestamp", "desc"));
  const columns: ColumnDef<ScoreRow>[] = [
    {
      accessorKey: "id",
      header: "",
      cell: ({ row }) => {
        if (row.original.objective.objective_type == ObjectiveType.ITEM) {
          return (
            <div className="flex justify-between w-full">
              {childIdToUniqueCategory[row.original.objective.id] && (
                <CategoryIcon
                  name={childIdToUniqueCategory[row.original.objective.id].name}
                  height={48}
                  width={48}
                />
              )}
              <div className="flex items-center justify-center w-12">
                <ObjectiveIcon
                  objective={row.original.objective}
                  gameVersion={currentEvent.game_version}
                  className="max-h-12"
                />
              </div>
            </div>
          );
        }
        if (iconMap[row.original.objective.name]) {
          return (
            <div className="flex justify-left w-full">
              <CategoryIcon
                name={row.original.objective.name}
                height={48}
                width={48}
              />
            </div>
          );
        }
      },
      enableSorting: false,
      size: 150,
    },
    {
      accessorKey: "team.name",
      header: "",
      cell: ({ row }) => (
        <TeamName className={"font-bold text-lg"} team={row.original.team} />
      ),
      filterFn: "includesString",
      meta: {
        filterVariant: "enum",
        filterPlaceholder: "Team",
        options: currentEvent.teams.map((team) => team.name),
      },
      enableSorting: false,
      size: 200,
    },
    {
      accessorKey: "objective.name",
      header: "",
      size: 300,
      cell: ({ row }) => (
        <div className="flex flex-col gap-1 py-3 min-h-[3rem] max-w-[280px] overflow-hidden">
          <span className="truncate whitespace-nowrap">
            {row.original.objective.name}
          </span>
          {row.original.objective.objective_type == ObjectiveType.ITEM &&
            row.original.objective.extra && (
              <span
                className="text-info truncate whitespace-nowrap block cursor-help"
                title={row.original.objective.extra}
              >
                [{row.original.objective.extra}]
              </span>
            )}
        </div>
      ),
      filterFn: "includesString",
      meta: {
        filterVariant: "string",
        filterPlaceholder: "Objective",
      },
      enableSorting: false,
    },
    {
      id: "category",
      accessorFn: (row) => {
        if (childIdToUniqueCategory[row.objective.id]) {
          return childIdToUniqueCategory[row.objective.id].name;
        }
        return childIdToParentCategory[row.objective.id]?.name || "";
      },
      header: "",
      size: 200,
      filterFn: "includesString",
      meta: {
        filterVariant: "string",
        filterPlaceholder: "Parent",
      },
      enableSorting: false,
    },
    { accessorKey: "points", header: "Points", enableSorting: false },
    {
      accessorKey: "rank",
      header: "Rank",
      cell: ({ row }) => (
        <span>{row.original.rank > 0 && <>{row.original.rank}</>}</span>
      ),
      size: 100,
      enableSorting: false,
    },
    {
      accessorKey: "timestamp",
      header: "Timestamp",
      cell: ({ row }) => {
        if (timeFormat === "relative") {
          return (
            <span>
              {getDeltaTimeBetween(
                row.original.timestamp,
                currentEvent.event_start_time
              )}
            </span>
          );
        }
        return <span>{new Date(row.original.timestamp).toLocaleString()}</span>;
      },
      size: 200,
    },
  ];

  return (
    <div className="flex flex-col gap-4 py-4">
      <fieldset className="fieldset bg-base-100 border-base-300 rounded-box border p-4 flex flex-row gap-10 w-80">
        <legend className="fieldset-legend"></legend>
        <label className="label w-30">
          <input
            type="checkbox"
            className="toggle"
            onChange={(e) =>
              setTimeFormat(e.target.checked ? "relative" : "absolute")
            }
          />
          <span className="label-text">
            {timeFormat === "relative" ? "Relative" : "Absolute"} Time
          </span>
        </label>
        <label className="label">
          <input
            className="checkbox"
            type="checkbox"
            onChange={(e) => setOnlyShowRanked(e.target.checked)}
          />
          <span className="label-text">Show Ranked Only</span>
        </label>
      </fieldset>
      <Table
        columns={columns}
        data={scoreRows.filter((s) => {
          if (s.objective.objective_type == ObjectiveType.TEAM) {
            return false;
          }
          if (onlyShowRanked) {
            return s.rank > 0;
          }
          return true;
        })}
        className="h-[70vh]"
      ></Table>
    </div>
  );
}
