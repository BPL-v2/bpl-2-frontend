import { CharacterStat, LadderEntry, Team } from "@client/api";
import { CellContext, ColumnDef, sortingFns } from "@tanstack/react-table";
import { GlobalStateContext } from "@utils/context-provider";
import { getTotalPoints, totalPoints } from "@utils/utils";
import { JSX, useContext, useMemo } from "react";

import {
  preloadLadderData,
  useGetEventStatus,
  useGetLadder,
  useGetStreams,
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
  ClipboardDocumentListIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { POPointRules } from "@rules/po-points";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getSkillColor } from "@utils/gems";
import { calcPersonalPoints } from "@utils/personal-points";
import { LadderPortrait } from "@components/character/ladder-portrait";
import { twMerge } from "tailwind-merge";
import { defaultPreferences } from "@mytypes/preferences";
import { TwitchFilled } from "@icons/twitch";
import { renderScore } from "@utils/score";

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
  const { streams = [] } = useGetStreams(currentEvent.id);
  const showAlwaysLadder = ["Stream"];
  const streamsByUser = streams.reduce(
    (acc, stream) => {
      if (stream.backend_user_id) {
        acc[stream.backend_user_id] = stream;
      }
      return acc;
    },
    {} as { [userId: number]: (typeof streams)[0] },
  );
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
  const userMap = useMemo(
    () =>
      users?.reduce((acc: { [userId: number]: (typeof users)[0] }, user) => {
        acc[user.id] = user;
        return acc;
      }, {}) || {},
    [users],
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
          id: "Stream",
          header: "",
          cell: (info) =>
            streamsByUser[info.row.original.character?.user_id || 0] &&
            info.row.original.twitch_account && (
              <Link
                to={"/streams/$twitchAccount"}
                params={{
                  twitchAccount: info.row.original.twitch_account,
                }}
              >
                <TwitchFilled className="size-5" brandColor />
              </Link>
            ),
          enableSorting: false,
          size: 30,
          meta: {
            filterVariant: "boolean",
          },
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
          id: "Discord",
          accessorFn: (row) => {
            if (!row.user_id) return "";
            const user = userMap[row.user_id];
            if (!user || !user.discord_name || !user.discord_id) return "";
            return user.discord_name + `#` + user.discord_id;
          },
          header: "",
          cell: (info) => {
            const user = userMap[info.row.original.user_id || 0];
            if (!user || !user.discord_name || !user.discord_id) {
              return "null";
            }
            return (
              <div className="flex items-center gap-2">
                <ClipboardDocumentListIcon
                  className="size-6 transition-transform duration-100 select-none hover:cursor-pointer hover:text-primary active:scale-110 active:text-secondary"
                  onClick={() =>
                    navigator.clipboard.writeText("<@" + user.discord_id + "> ")
                  }
                />
                {user.discord_name}
              </div>
            );
          },
          enableSorting: false,
          size: 200,
          filterFn: "includesString",
          meta: {
            filterVariant: "string",
            filterPlaceholder: "Discord",
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
        preferences.ladder[col.id as keyof typeof preferences.ladder] ||
        showAlwaysLadder.includes(col.id as string)
      );
    });
  }, [isMobile, currentEvent, preferences, userMap, getTeam, setPreferences]);

  if (ladderIsError || usersIsError) {
    return (
      <div className="alert alert-error">
        <div>
          <span>Error loading ladder data.</span>
        </div>
      </div>
    );
  }
  const categoryNames = scores?.children.map((category) => category.name) || [];
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
      cell: ({ row }) => renderScore(row.original.total),
      size: 120,
    },
    ...categoryNames.map((categoryName) => ({
      header: categoryName == "Personal Objectives" ? "P.O." : categoryName,
      accessorKey: categoryName,
      key: `column-${categoryName}`,
      // @ts-ignore
      cell: ({ row }) =>
        renderScore(row.original[categoryName as keyof RowDef] || 0),
      // @ts-ignore
      sorter: (a, b) => a[categoryName] - b[categoryName],
      size: 140,
    })),
  ];

  const objs = scores?.children.find(
    (category) => category.name === "Personal Objectives",
  )?.children;
  const totalObjective = objs?.find(
    (obj) => obj.scoring_presets[0]?.point_cap || 0 > 0,
  );
  const checkPoints = objs?.filter((obj) => !obj.scoring_presets[0]?.point_cap);
  const firstCheckpointCompleted =
    checkPoints?.some((obj) => new Date(obj.valid_to || "") < new Date()) ||
    false;
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
      {firstCheckpointCompleted && (
        <div>
          <div className="divider divider-primary">
            Personal Objective Points
          </div>
          {totalObjective && checkPoints && (
            <div className="card bg-base-300">
              <div className="card-body">
                <div className="flex flex-col gap-2">
                  {currentEvent.teams
                    .sort((a, b) => {
                      if (a.id === eventStatus?.team_id) return -1;
                      if (b.id === eventStatus?.team_id) return 1;
                      return (
                        (totalObjective.team_score[b.id]?.completions[0]
                          ?.number || 0) -
                        (totalObjective.team_score[a.id]?.completions[0]
                          ?.number || 0)
                      );
                    })
                    .slice(
                      0,
                      preferences.limitTeams
                        ? preferences.limitTeams
                        : undefined,
                    )

                    .map((team) => {
                      const values = [];
                      const extra = [];
                      let total = 0;
                      for (const obj of checkPoints) {
                        const teamScore = obj.team_score[team.id];
                        if (!teamScore || !totalPoints(teamScore)) {
                          continue;
                        }
                        const number = teamScore.completions[0]?.number;
                        total += totalPoints(teamScore);
                        values.push(number);
                        extra.push(totalPoints(teamScore));
                      }
                      const cap =
                        totalObjective?.scoring_presets[0]?.point_cap || 0;
                      const current = Math.min(
                        totalObjective?.team_score[team.id]?.completions[0]
                          ?.number || 0,
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
        </div>
      )}
      <div className="divider divider-primary">Ladder</div>
      {!isMobile && (
        <div className="mb-4 flex flex-wrap justify-between gap-1">
          {Object.keys(defaultPreferences.ladder).map((label) => {
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
                  "btn rounded-lg px-2 btn-sm",
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
