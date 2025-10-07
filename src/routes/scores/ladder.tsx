import { CharacterStat, LadderEntry, Team } from "@client/api";
import { getRootCategoryNames } from "@mytypes/scoring-category";
import { CellContext, ColumnDef, sortingFns } from "@tanstack/react-table";
import { GlobalStateContext } from "@utils/context-provider";
import { getTotalPoints } from "@utils/utils";
import { JSX, useContext, useMemo } from "react";

import {
  preloadLadderData,
  useGetEventStatus,
  useGetLadder,
  useGetUsers,
} from "@client/query";
import { AscendancyName } from "@components/character/ascendancy-name";
import { AscendancyPortrait } from "@components/character/ascendancy-portrait";
import { ExperienceBar } from "@components/character/experience-bar";
import POProgressBar from "@components/personal-objective/po-progress";
import Table from "@components/table/table";
import { TeamName } from "@components/team/team-name";
import TeamScoreDisplay from "@components/team/team-score";
import {
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { POPointRules } from "@rules/po-points";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getSkillColor } from "@utils/gems";
import { calcPersonalPoints } from "@utils/personal-points";
import { LadderPortrait } from "@components/character/ladder-portrait";
import { twMerge } from "tailwind-merge";

type RowDef = {
  total: number;
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
  // @ts-ignore context is not typed
  loader: async ({ context: { queryClient } }) => {
    preloadLadderData(queryClient);
  },
});

function LadderTab(): JSX.Element {
  const { scores, currentEvent, isMobile, preferences, setPreferences } =
    useContext(GlobalStateContext);
  const { rules } = Route.useSearch();
  const { data: ladder, isError: ladderIsError } = useGetLadder(
    currentEvent.id,
  );
  const { eventStatus } = useGetEventStatus(currentEvent.id);
  const { data: users = [], isError: usersIsError } = useGetUsers(
    currentEvent.id,
  );
  const teamMap = useMemo(
    () =>
      currentEvent?.teams?.reduce((acc: { [teamId: number]: Team }, team) => {
        acc[team.id] = team;
        return acc;
      }, {}) || {},
    [currentEvent],
  );

  const getTeam = useMemo(() => {
    const userToTeam =
      users?.reduce(
        (acc, user) => {
          acc[user.id] = teamMap[user.team_id];
          return acc;
        },
        {} as { [userId: number]: Team },
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
    let columns: ColumnDef<LadderEntry>[] = [];
    if (!isMobile) {
      columns = [
        {
          id: "Rank",
          accessorKey: "rank",
          header: "#",
          size: 50,
        },
        {
          id: "Account",
          accessorKey: "account_name",
          header: "",
          cell: (info) => (
            <a
              className="flex cursor-pointer items-center gap-1 hover:text-primary"
              href={`https://www.pathofexile.com/account/view-profile/${info.row.original.account_name.replace("#", "-")}/characters`}
              target="_blank"
            >
              <ArrowTopRightOnSquareIcon className="inline size-4" />
              {info.row.original.account_name}
            </a>
          ),
          enableSorting: false,
          size: 250,
          filterFn: "includesString",
          meta: {
            filterVariant: "string",
            filterPlaceholder: "Account",
          },
        },
        {
          id: "Character",
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
              to={"/profile/$userId/$eventId/$characterId"}
              className="flex items-center gap-1 hover:text-primary"
              params={{
                userId: info.row.original.character?.user_id || 0,
                characterId: info.row.original.character?.id || "",
                eventId: currentEvent.id,
              }}
            >
              <ArrowTopRightOnSquareIcon className="inline size-4" />
              {info.row.original.character_name}
            </Link>
          ),
        },
        {
          id: "Team",
          accessorFn: (row) => getTeam(row.user_id)?.name,
          header: " ",
          cell: (info) => (
            <TeamName team={getTeam(info.row.original.user_id)} />
          ),
          enableSorting: false,
          size: 200,
          filterFn: "includesString",
          meta: {
            filterVariant: "enum",
            filterPlaceholder: "Team",
            options: currentEvent.teams.map((team) => team.name),
          },
        },
        {
          id: "Ascendancy",
          accessorFn: (row) => row.character_class + row.character?.main_skill,
          header: "",
          cell: (info) => {
            return (
              <div className="flex items-center gap-2">
                <AscendancyPortrait
                  character_class={info.row.original.character_class}
                  className="size-10 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <span
                    className={getSkillColor(
                      info.row.original.character?.main_skill,
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
            filterVariant: "string",
            filterPlaceholder: "Ascendancy / Skill",
          },
        },
        {
          id: "Level",
          accessorKey: "experience",
          header: "Level",
          cell: (info) => (
            <ExperienceBar
              experience={info.row.original.experience}
              level={info.row.original.level}
              width={60}
              className="text-lg font-bold"
            />
          ),
          sortingFn: sortingFns.basic,
          size: 120,
        },
        {
          id: "Delve",
          accessorKey: "delve",
          header: "Delve",
          size: 100,
        },
        ...[
          "DPS",
          "EHP",
          "Armour",
          "Evasion",
          "ES",
          "Ele max hit",
          "Phys max hit",
          "HP",
          "Mana",
          "Movement Speed",
        ].map((stat) => {
          const key = stat
            .replaceAll(" ", "_")
            .toLowerCase() as keyof CharacterStat;
          return {
            id: stat,
            accessorFn: (row: LadderEntry) => row.stats?.[key] || 0,
            header: () => (
              <div
                className="tooltip tooltip-bottom w-18 overflow-hidden text-ellipsis"
                data-tip={stat}
              >
                <span className="">{stat}</span>
              </div>
            ),
            cell: (info: CellContext<LadderEntry, unknown>) => {
              const value = info.getValue<number>();
              if (value === undefined) {
                return 0;
              }
              if (value === 2147483647) {
                return "inf";
              }
              return value.toLocaleString();
            },
            size: 100,
            sortingFn: sortingFns.basic,
            meta: {
              filterVariant: "number",
            },
          };
        }),
        {
          id: "P.O.",
          header: "P.O.",
          accessorFn: (row) => calcPersonalPoints(row),
          cell: (info) => info.getValue(),
          size: 90,
        },
        {
          id: "Pantheon",
          header: "Pantheon",
          accessorFn: (row) => row.character?.pantheon,
          cell: (info) =>
            info.row.original.character?.pantheon ? (
              <CheckCircleIcon className="size-6 text-success" />
            ) : (
              <XCircleIcon className="size-6 text-error" />
            ),
          enableSorting: false,
          meta: {
            filterVariant: "boolean",
          },
        },
        {
          id: "Uber Lab",
          accessorFn: (row) => (row.character?.ascendancy_points || 0) > 6,
          cell: (info) =>
            (info.row.original.character?.ascendancy_points || 0) > 6 ? (
              <CheckCircleIcon className="size-6 text-success" />
            ) : (
              <XCircleIcon className="size-6 text-error" />
            ),
          enableSorting: false,
          header: "Uber Lab",
          meta: {
            filterVariant: "boolean",
          },
        },
        {
          id: "Atlas",
          accessorFn: (row) => row.character?.atlas_node_count || 0,
          header: "Atlas",
        },
      ];
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
          size: 375,
        },
      ];
    }
    return columns.filter((col) => {
      return (
        isMobile ||
        preferences.ladder[col.id as keyof typeof preferences.ladder]
      );
    });
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
  const categoryNames = getRootCategoryNames(currentEvent.game_version);
  const rows = currentEvent.teams.map((team) => {
    return {
      team: team,
      key: team?.id?.toString(),
      total: getTotalPoints(scores)[team.id] || 0,
      ...Object.fromEntries(
        categoryNames.map((categoryName) => {
          const child = scores?.children.find(
            (category) => category.name === categoryName,
          );
          if (!child) {
            return [categoryName, 0];
          }
          return [categoryName, getTotalPoints(child)[team.id] || 0];
        }),
      ),
    } as RowDef;
  });
  const scoreColumns: ColumnDef<RowDef>[] = [
    {
      accessorKey: "team.name",
      header: "Team",
      cell: ({ row }) => (
        <TeamName className="font-semibold" team={row.original?.team} />
      ),
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => {
        return row.original.total;
      },
    },
    ...categoryNames.map((categoryName) => ({
      header: categoryName == "Personal Objectives" ? "P.O." : categoryName,
      accessorKey: categoryName,
      key: `column-${categoryName}`,
      // @ts-ignore
      sorter: (a, b) => a[categoryName] - b[categoryName],
      size: 160,
    })),
  ];

  const objs = scores?.children.find(
    (category) => category.name === "Personal Objectives",
  )?.children;
  const totalObjective = objs?.find(
    (obj) => obj.scoring_preset?.point_cap || 0 > 0,
  );
  const checkPoints = objs?.filter((obj) => !obj.scoring_preset?.point_cap);
  return (
    <>
      {rules ? (
        <div className="my-4 w-full rounded-box bg-base-200 p-8">
          <article className="prose max-w-4xl text-left">
            <POPointRules />
          </article>
        </div>
      ) : null}
      {isMobile ? (
        <TeamScoreDisplay objective={scores} />
      ) : (
        <>
          <div className="divider divider-primary">Team Scores</div>
          <Table
            data={rows.sort((a, b) => b.total - a.total)}
            columns={scoreColumns}
            className="max-h-[30vh]"
          ></Table>
        </>
      )}
      <div className="divider divider-primary">Personal Objective Points</div>
      {totalObjective && checkPoints && (
        <div className="card bg-base-300">
          <div className="card-body">
            <div className="flex flex-col gap-2">
              {currentEvent.teams
                .sort((a, b) => {
                  if (a.id === eventStatus?.team_id) return -1;
                  if (b.id === eventStatus?.team_id) return 1;
                  return (
                    (totalObjective.team_score[b.id]?.number || 0) -
                    (totalObjective.team_score[a.id]?.number || 0)
                  );
                })
                .slice(
                  0,
                  preferences.limitTeams ? preferences.limitTeams : undefined,
                )

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
                    cap,
                  );
                  total += current;
                  return (
                    <div className="flex flex-col" key={team.id}>
                      <div className="flex flex-row justify-start gap-2 text-lg">
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
      {!isMobile && (
        <div className="mb-4 flex flex-wrap gap-2">
          {Object.keys(preferences.ladder).map((label) => {
            const key = label as keyof typeof preferences.ladder;
            return (
              <button
                key={label}
                onClick={() => {
                  setPreferences({
                    ...preferences,
                    ladder: {
                      ...preferences.ladder,
                      [label]: !preferences.ladder[key],
                    },
                  });
                }}
                className={twMerge(
                  "btn rounded-xl px-2 btn-sm",
                  preferences.ladder[key]
                    ? "btn-primary"
                    : "border-primary bg-base-100/0 text-primary",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
      <Table
        data={ladder?.sort((a, b) => a.rank - b.rank) || []}
        columns={ladderColumns}
        className="h-[70vh]"
      />
    </>
  );
}
