import { JSX, useContext, useMemo } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import { getRootCategoryNames } from "@mytypes/scoring-category";
import { getTotalPoints } from "@utils/utils";
import { GameVersion, LadderEntry, Team } from "@client/api";
import { ColumnDef, sortingFns } from "@tanstack/react-table";

import { AscendancyName } from "@components/ascendancy-name";
import { ExperienceBar } from "@components/experience-bar";
import { TeamName } from "@components/team-name";
import { LadderPortrait } from "@components/ladder-portrait";
import { AscendancyPortrait } from "@components/ascendancy-portrait";
import Table from "@components/table";
import { ascendancies, poe2Mapping } from "@mytypes/ascendancy";
import { calcPersonalPoints } from "@utils/personal-points";
import { createFileRoute, Link } from "@tanstack/react-router";
import POProgressBar from "@components/po-progress";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/16/solid";
import { useGetLadder, useGetUsers } from "@client/query";
import { POPointRules } from "@rules/po-points";
import { getSkillColor } from "@utils/gems";
import TeamScoreDisplay from "@components/team-score";
type RowDef = {
  default: number;
  team: Team;
  key: string;
  "Personal Objectives": number;
  Collections: number;
  Uniques: number;
  Bounties: number;
  Races: number;
  Dailies: number;
};

export const Route = createFileRoute("/scores/ladder")({
  component: LadderTab,
});

export function LadderTab(): JSX.Element {
  const { scores, currentEvent, isMobile, preferences, setPreferences } =
    useContext(GlobalStateContext);
  const { rules } = Route.useSearch();
  const { data: ladder, isError: ladderIsError } = useGetLadder(
    currentEvent.id
  );
  const { data: users, isError: usersIsError } = useGetUsers(currentEvent.id);
  const teamMap = useMemo(
    () =>
      currentEvent?.teams?.reduce((acc: { [teamId: number]: Team }, team) => {
        acc[team.id] = team;
        return acc;
      }, {}) || {},
    [currentEvent]
  );

  const getTeam = useMemo(() => {
    const userToTeam =
      users?.reduce(
        (acc, user) => {
          acc[user.id] = teamMap[user.team_id];
          return acc;
        },
        {} as { [userId: number]: Team }
      ) || {};
    return (userId: number | undefined): Team | undefined => {
      if (userId === undefined) {
        return undefined;
      }
      return userToTeam[userId];
    };
  }, [users, teamMap]);

  const ladderColumns = useMemo(() => {
    if (!currentEvent) {
      return [];
    }
    let columns: ColumnDef<LadderEntry, any>[] = [];
    if (!isMobile) {
      columns = [
        {
          accessorKey: "rank",
          header: "Rank",
          sortingFn: sortingFns.basic,
          size: 100,
        },
        {
          accessorKey: "character_name",
          header: "",
          enableSorting: false,
          size: 250,
          filterFn: "includesString",
          meta: {
            filterVariant: "string",
            filterPlaceholder: "Character",
          },
          cell: (info) => (
            <Link
              to={`/profile/$userId/$eventId/$characterId`}
              params={{
                userId: info.row.original.character?.user_id || 0,
                characterId: info.row.original.character?.id || "",
                eventId: currentEvent.id,
              }}
            >
              {info.row.original.character_name}
            </Link>
          ),
        },
        // {
        //   accessorKey: "account_name",
        //   header: "",
        //   enableSorting: false,
        //   size: 250,
        //   filterFn: "includesString",
        //   meta: {
        //     filterVariant: "string",
        //     filterPlaceholder: "Account",
        //   },
        //   cell: (info) => {
        //     const accountName = info.getValue<string>();
        //     return info.row.original.user_id ? (
        //       <Link
        //         to={`/profile/$userId`}
        //         params={{ userId: info.row.original.user_id }}
        //         rel="noopener noreferrer"
        //       >
        //         {accountName}
        //       </Link>
        //     ) : (
        //       accountName
        //     );
        //   },
        // },
        {
          accessorFn: (row) => getTeam(row.user_id)?.name,
          header: " ",
          cell: (info) => (
            <TeamName team={getTeam(info.row.original.user_id)} />
          ),
          enableSorting: false,
          size: 250,
          filterFn: "includesString",
          meta: {
            filterVariant: "enum",
            filterPlaceholder: "Team",
            options: currentEvent.teams.map((team) => team.name),
          },
        },
        {
          accessorKey: "character_class",
          header: "",
          cell: (info) => {
            return (
              <div className="flex items-center gap-2">
                <AscendancyPortrait
                  character_class={info.row.original.character_class}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex flex-col">
                  <span
                    className={getSkillColor(
                      info.row.original.character?.main_skill
                    )}
                  >
                    {" "}
                    {info.row.original.character?.main_skill}
                  </span>
                  <AscendancyName
                    character_class={info.row.original.character_class}
                  />
                </div>
              </div>
            );
          },
          size: 300,
          filterFn: "includesString",
          enableSorting: false,
          meta: {
            filterVariant: "enum",
            filterPlaceholder: "Ascendancy",
            options:
              currentEvent.game_version === GameVersion.poe1
                ? Object.keys(ascendancies[GameVersion.poe1])
                : Object.entries(poe2Mapping).map(([key, value]) => ({
                    label: value,
                    value: key,
                  })),
          },
        },
        {
          accessorFn: (row) => row.stats?.dps || 0,
          header: "DPS",
          cell: (info) => info.getValue<number>().toLocaleString(),
        },

        {
          accessorFn: (row) => row.stats?.ehp || 0,
          header: "EHP",

          cell: (info) => {
            const ehp = info.getValue<number>();
            if (ehp == 2147483647) return "inf";
            return ehp.toLocaleString();
          },
        },

        {
          accessorKey: "experience",
          header: "Level",
          cell: (info) => (
            <ExperienceBar
              experience={info.row.original.experience}
              level={info.row.original.level}
            />
          ),
          sortingFn: sortingFns.basic,
          size: 150,
        },
      ];
      if (preferences.ladder?.showPoPoints) {
        columns.push({
          header: "P.O. Finished",
          accessorFn: (row) => calcPersonalPoints(row) == 9,
          cell: (info) =>
            info.getValue() ? (
              <CheckCircleIcon className="h-6 w-6 text-success" />
            ) : (
              <XCircleIcon className="h-6 w-6 text-error" />
            ),
          enableSorting: false,
          meta: {
            filterVariant: "boolean",
          },
          size: 170,
        });
        columns.push({
          header: "Pantheon",
          accessorFn: (row) => row.character?.pantheon,
          cell: (info) =>
            info.row.original.character?.pantheon ? (
              <CheckCircleIcon className="h-6 w-6 text-success" />
            ) : (
              <XCircleIcon className="h-6 w-6 text-error" />
            ),
          enableSorting: false,
          meta: {
            filterVariant: "boolean",
          },
        });
        columns.push({
          accessorFn: (row) => (row.character?.ascendancy_points || 0) > 6,
          cell: (info) =>
            (info.row.original.character?.ascendancy_points || 0) > 6 ? (
              <CheckCircleIcon className="h-6 w-6 text-success" />
            ) : (
              <XCircleIcon className="h-6 w-6 text-error" />
            ),
          enableSorting: false,
          header: "Uber Lab",
          meta: {
            filterVariant: "boolean",
          },
        });
        columns.push({
          accessorFn: (row) => row.character?.atlas_node_count || 0,
          header: "Atlas Points",
          sortingFn: sortingFns.basic,
        });
      }
      columns.push({
        // @ts-ignore
        header: (
          <button
            className="btn btn-primary"
            onClick={() => {
              setPreferences({
                ...preferences,
                ladder: {
                  ...preferences.ladder,
                  showPoPoints: !preferences.ladder.showPoPoints,
                },
              });
            }}
          >
            {preferences.ladder.showPoPoints ? "Hide" : "Show"} P.O.
          </button>
        ),
        width: 50,
        id: "showPoPoints",
      });
    } else {
      columns = [
        {
          accessorFn: (row) =>
            row.account_name +
            row.character_name +
            row.character_class +
            row.character?.main_skill,
          header: " ",
          filterFn: "includesString",
          meta: {
            filterVariant: "string",
            filterPlaceholder: "Search",
          },
          cell: (info) => (
            <LadderPortrait
              entry={info.row.original}
              team={getTeam(info.row.original.user_id)}
            />
          ),
          enableSorting: false,
          size: 400,
        },
      ];
    }
    return columns;
  }, [isMobile, currentEvent, preferences, getTeam, setPreferences]);

  if (ladderIsError || usersIsError) {
    return (
      <div className="alert alert-error">
        <div>
          <span>Error loading ladder data.</span>
        </div>
      </div>
    );
  }
  let rows: RowDef[] = [];
  const categoryNames = getRootCategoryNames(currentEvent.game_version);
  if (scores) {
    const categories = scores.children.filter((child) =>
      categoryNames.includes(child.name)
    );
    categories.push(scores);
    const points = categories.reduce(
      (acc, category) => {
        if (!category) {
          return acc;
        }
        const points = getTotalPoints(category);
        for (const [teamId, teamPoints] of Object.entries(points)) {
          const id = parseInt(teamId);
          if (!acc[id]) {
            acc[id] = {};
          }
          acc[id][category.name] = teamPoints;
        }
        return acc;
      },
      {} as { [teamId: number]: { [categoryName: string]: number } }
    );
    rows = Object.entries(points).map(([teamId, teamPoints]) => {
      return {
        team: teamMap[parseInt(teamId)],
        key: teamId,
        ...teamPoints,
      } as RowDef;
    });
  } else {
    rows = currentEvent.teams.map((team) => {
      return {
        team: team,
        key: team?.id?.toString(),
        default: 0,
        ...Object.fromEntries(
          categoryNames.map((categoryName) => [categoryName, 0])
        ),
      } as RowDef;
    });
  }
  const scoreColumns: any[] = [
    {
      title: "Team",
      dataIndex: ["team", "name"],
      render: (row: any) => (
        <TeamName className="font-semibold" team={row.team} />
      ),
      key: "team",
    },
    {
      title: "Total",
      dataIndex: "default",
      key: "default",
      defaultSortOrder: "descend",
    },
    ...categoryNames.map((categoryName) => ({
      title: categoryName,
      dataIndex: categoryName,
      key: `column-${categoryName}`,
      sorter: (a: any, b: any) => a[categoryName] - b[categoryName],
    })),
  ];

  const objs = scores?.children.find(
    (category) => category.name === "Personal Objectives"
  )?.children;
  const totalObjective = objs?.find(
    (obj) => obj.scoring_preset?.point_cap || 0 > 0
  );
  const checkPoints = objs?.filter((obj) => !obj.scoring_preset?.point_cap);
  return (
    <>
      {rules ? (
        <div className="w-full bg-base-200 my-4 p-8 rounded-box">
          <article className="prose text-left max-w-4xl">
            <POPointRules />
          </article>
        </div>
      ) : null}
      {isMobile ? (
        <TeamScoreDisplay objective={scores} />
      ) : (
        <>
          <div className="divider divider-primary ">Team Scores</div>
          <table className="table bg-base-300 text-lg">
            <thead className="bg-base-200">
              <tr>
                {scoreColumns.map((column) => (
                  <th key={`header-${column.key}`}>{column.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows
                .sort((a, b) => b.default - a.default)
                .map((row) => (
                  <tr key={row.key} className="hover:bg-base-200/50">
                    {scoreColumns.map((column) => (
                      <td key={`column-${column.key}`}>
                        {column.render
                          ? column.render(row)
                          : // @ts-ignore: column.dataIndex can be used to access the row data
                            row[column.dataIndex]}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </>
      )}
      <div className="divider divider-primary">Personal Objective Points</div>
      {totalObjective && checkPoints && (
        <div className="card bg-base-300">
          <div className="card-body">
            <div className="flex flex-col gap-2">
              {currentEvent.teams
                .sort((a, b) => {
                  const aScore = totalObjective.team_score[a.id]?.number || 0;
                  const bScore = totalObjective.team_score[b.id]?.number || 0;
                  return bScore - aScore;
                })
                .map((team) => {
                  const values = [];
                  const extra = [];
                  let total = 0;
                  for (const obj of checkPoints) {
                    const teamScore = obj.team_score[team.id];
                    if (!teamScore || !teamScore.points) {
                      continue;
                    }
                    const number = teamScore.number;
                    total += teamScore.points;
                    values.push(number);
                    extra.push(teamScore.points);
                  }
                  const cap = totalObjective?.scoring_preset?.point_cap || 0;
                  const current = Math.min(
                    totalObjective?.team_score[team.id]?.number || 0,
                    cap
                  );
                  total += current;
                  return (
                    <div className="flex flex-col" key={team.id}>
                      <div className="flex flex-row justify-start text-lg gap-2">
                        <TeamName className="font-semibold" team={team} />
                        <div className="">{`${total} = (${current} + ${extra.join(" + ")})`}</div>
                      </div>
                      <POProgressBar
                        checkpoints={values}
                        extra={extra}
                        max={cap}
                        current={current}
                      />
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
      <div className="divider divider-primary">Ladder</div>
      <Table
        data={ladder?.sort((a, b) => a.rank - b.rank) || []}
        columns={ladderColumns}
        className="h-[70vh]"
      />
    </>
  );
}
