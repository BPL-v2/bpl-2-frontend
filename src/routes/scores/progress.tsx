import { ObjectiveType, Score, ScoringMethod, Team } from "@client/api";
import { ObjectiveIcon } from "@components/objective-icon";
import Table from "@components/table";
import { TeamName } from "@components/team-name";
import { CategoryIcon, iconMap } from "@icons/category-icons";
import { ScoreObjective } from "@mytypes/score";
import { createFileRoute } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { GlobalStateContext } from "@utils/context-provider";
import { getDeltaTimeBetween } from "@utils/time";
import { flatMap } from "@utils/utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useContext, useRef, useState } from "react";
import { AlignedData } from "uplot";
import UplotReact from "uplot-react";
dayjs.extend(relativeTime);

export const Route = createFileRoute("/scores/progress")({
  component: RouteComponent,
});

type ScoreRow = {
  team: Team | undefined;
  objective: ScoreObjective;
} & Score;

function RouteComponent() {
  const { currentEvent, scores, preferences } = useContext(GlobalStateContext);
  const plotRef = useRef<HTMLDivElement>(null);
  const [timeFormat, setTimeFormat] = useState<"relative" | "absolute">(
    "absolute"
  );
  const [deviationFromAvg, setDeviationFromAvg] = useState(false);
  const fontColor = preferences.theme === "dark" ? "white" : "black";

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

  const childIdToUniqueCategory = Object.values(uniqueCategories).reduce(
    (acc, category) => {
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
    .filter((s) => s.points > 0);

  const timestamp2Scores: Record<number, Record<number, number>> = {};
  const currentVal = currentEvent.teams.reduce(
    (acc, team) => {
      acc[team.id] = 0;
      return acc;
    },
    {} as Record<number, number>
  );
  currentVal[0] = 0;

  for (const scoreRow of scoreRows
    .filter(
      (s) =>
        s.objective.scoring_preset?.scoring_method !=
        ScoringMethod.POINTS_FROM_VALUE
    )
    .sort((a, b) => a.timestamp - b.timestamp)) {
    if (!scoreRow.team) continue;
    currentVal[scoreRow.team.id] += scoreRow.points;
    currentVal[0] =
      currentEvent.teams.reduce(
        (acc, team) => acc + (currentVal[team.id] || 0),
        0
      ) / currentEvent.teams.length;
    if (!timestamp2Scores[scoreRow.timestamp]) {
      timestamp2Scores[scoreRow.timestamp] = { ...currentVal };
    }
    timestamp2Scores[scoreRow.timestamp][scoreRow.team.id] =
      currentVal[scoreRow.team.id];
  }
  const timestamps: number[] = [];
  const teamData = currentEvent.teams.reduce(
    (acc, team) => {
      acc[team.id] = [];
      return acc;
    },
    {} as Record<number, number[]>
  );
  teamData[0] = []; // For the average score
  const eventStart = new Date(currentEvent.event_start_time).getTime() / 1000;
  const eventEnd = new Date(currentEvent.event_end_time).getTime() / 1000;
  for (const [timestamp, scores] of Object.entries(timestamp2Scores)) {
    const ts = parseInt(timestamp);
    if (ts < eventStart || ts > eventEnd) continue;

    timestamps.push(ts);
    for (const team of currentEvent.teams) {
      let val = scores[team.id] || 0;
      if (deviationFromAvg) {
        val = Math.round(val - scores[0]);
      }
      teamData[team.id].push(val);
    }
  }
  const data: AlignedData = [
    new Float64Array(timestamps),
    ...currentEvent.teams
      .sort((a, b) => a.id - b.id)
      .map((team) => new Float64Array(teamData[team.id])),
  ];
  const options: uPlot.Options = {
    title: "Progression (without P.O. / Culmulative Delve)",
    width: 800,
    height: 800,
    legend: { show: true },
    axes: [
      {
        side: 2,
        scale: "x",
        ticks: { size: 0 },
        label: "Time",
        stroke: fontColor,
      },
      {
        label: "Points",
        labelFont: "16px sans-serif",
        side: 3,
        scale: "points",
        stroke: fontColor,
      },
    ],
    series: [
      {
        label: "time",
        points: { show: false },
        scale: "x",
      },
      ...currentEvent.teams
        .sort((a, b) => a.id - b.id)
        .map((team) => ({
          label: team.name,
          stroke: team.color,
          width: 2,
          points: {
            size: 8,
            stroke: team.color,
            fill: team.color,
          },
          scale: "points",
        })),
    ],
    scales: {
      x: {
        time: true,
        range: (self, initMin, initMax) => [
          self.scales.x.min || initMin,
          self.scales.x.max || initMax,
        ],
      },
    },
  };

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
        return (
          <span>
            {new Date(row.original.timestamp * 1000).toLocaleString()}
          </span>
        );
      },
      size: 200,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
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
        data={scoreRows
          .filter((s) => {
            if (s.objective.objective_type == ObjectiveType.TEAM) {
              return false;
            }
            if (onlyShowRanked) {
              return s.rank > 0;
            }
            return true;
          })
          .sort((a, b) => b.timestamp - a.timestamp)}
        className="h-[70vh]"
      ></Table>
      <div className="h-[1000px] bg-base-300 p-4 rounded-box mt-4">
        <fieldset className="fieldset bg-base-200 absolute p-2 px-4 rounded-box ml-8">
          <label className="label text-highlight-content">
            <input
              type="checkbox"
              className="checkbox"
              checked={deviationFromAvg}
              onChange={(e) => setDeviationFromAvg(e.target.checked)}
            />
            <span className="label-text">Show Deviation from Average</span>
          </label>
        </fieldset>
        <div ref={plotRef} className="h-full">
          <UplotReact
            options={options}
            data={data}
            onCreate={(chart) => {
              chart.setSize({
                width: plotRef.current?.clientWidth || 800,
                height: (plotRef.current?.clientHeight || 400) - 100,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
