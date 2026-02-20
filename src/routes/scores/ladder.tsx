import { Event, LadderEntry, Team } from "@client/api";
import { CellContext, ColumnDef, sortingFns } from "@tanstack/react-table";
import { GlobalStateContext } from "@utils/context-provider";
import { getTotalPoints } from "@utils/utils";
import { JSX, useContext, useMemo, useState } from "react";

import {
  preloadLadderData,
  useGetEventStatus,
  useGetItemMapping,
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
import { MultiSelectPercentage } from "@components/form/multi-select-percentage";
import Select from "@components/form/select";

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

function hoursToDaysAndHours(hours: number) {
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days > 0 ? days + " day" : ""}${days > 1 ? "s" : ""} ${remainingHours} hours`;
}

function getTimeSelectOptions(currentEvent: Event) {
  const eventStart = new Date(currentEvent.event_start_time);
  let eventEnd = new Date(currentEvent.event_end_time);
  const now = new Date();
  if (
    isNaN(eventStart.getTime()) ||
    isNaN(eventEnd.getTime()) ||
    now < eventStart
  ) {
    return [];
  }
  if (now < eventEnd) {
    eventEnd = now;
  }
  const hours = Math.ceil(
    (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60),
  );
  return [...Array(Math.ceil((hours + 1) / 2))].map((_, i) => ({
    label: hoursToDaysAndHours(2 * i),
    value: 2 * i,
  }));
}

function LadderTab(): JSX.Element {
  const { scores, currentEvent, isMobile, preferences, setPreferences } =
    useContext(GlobalStateContext);
  const { rules } = Route.useSearch();
  const [hoursAfterEventStart, setHoursAfterEventStart] = useState<number>();
  console.log("hoursAfterEventStart", hoursAfterEventStart);
  const { data: unsortedLadder, isError: ladderIsError } = useGetLadder(
    currentEvent.id,
    hoursAfterEventStart,
  );
  const ladder = useMemo(() => {
    return (
      unsortedLadder
        ?.slice()
        .sort((a, b) => {
          if (b.level === a.level) {
            return (b.xp || 0) - (a.xp || 0);
          }
          return b.level - a.level;
        })
        .map((entry, index) => ({ ...entry, rank: index + 1 })) || []
    );
  }, [unsortedLadder]);
  const { eventStatus } = useGetEventStatus(currentEvent.id);
  const { streams = [] } = useGetStreams(currentEvent.id);
  const { itemMapping = {} } = useGetItemMapping();
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const filteredLadder = useMemo(() => {
    if (!ladder) {
      return [];
    }
    if (selectedItems.length === 0) {
      return ladder;
    }
    return ladder?.filter((entry) => {
      for (const itemIdx of selectedItems) {
        if (!entry.item_indexes?.includes(itemIdx)) {
          return false;
        }
      }
      return true;
    });
  }, [ladder, selectedItems]);

  const percentagePlayersWithItem = useMemo(
    () =>
      filteredLadder?.reduce(
        (acc, entry) => {
          for (const skill of entry.item_indexes || []) {
            acc[skill] = (acc[skill] || 0) + 1 / (filteredLadder?.length || 1);
          }
          return acc;
        },
        {} as { [skillId: number]: number },
      ) || {},
    [filteredLadder],
  );

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
            streamsByUser[info.row.original.user_id || 0] &&
            info.row.original.twitch_name && (
              <Link
                to={"/streams/$twitchAccount"}
                params={{
                  twitchAccount: info.row.original.twitch_name || "",
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
          accessorKey: "poe_account",
          header: "",
          cell: (info) => (
            <a
              className="flex cursor-pointer items-center gap-1 hover:text-primary"
              href={`https://www.pathofexile.com/account/view-profile/${info.row.original.poe_account.replace("#", "-")}/characters`}
              target="_blank"
            >
              <ArrowTopRightOnSquareIcon className="inline size-4" />
              {info.row.original.poe_account}
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
                userId: info.row.original.user_id || 0,
                characterId: info.row.original.character_id || "",
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
          accessorFn: (row) => row.ascendancy + row.main_skill,
          header: "",
          cell: (info) => {
            return (
              <div className="flex items-center gap-2">
                <AscendancyPortrait
                  character_class={info.row.original.ascendancy}
                  className="size-10 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <span className={getSkillColor(info.row.original.main_skill)}>
                    {" "}
                    {info.row.original.main_skill}
                  </span>
                  <AscendancyName
                    character_class={info.row.original.ascendancy}
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
              experience={info.row.original.xp}
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
            .toLowerCase() as keyof LadderEntry;
          return {
            id: stat,
            accessorFn: (row: LadderEntry) => row[key] || 0,
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
          accessorFn: (row) => row.pantheon,
          cell: (info) =>
            info.row.original.pantheon ? (
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
          accessorFn: (row) => (row.ascendancy_points || 0) > 6,
          cell: (info) =>
            (info.row.original.ascendancy_points || 0) > 6 ? (
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
          accessorFn: (row) => row.atlas_points || 0,
          header: "Atlas",
        },
      ];
    } else {
      columns = [
        {
          accessorFn: (row) =>
            row.poe_account +
            row.character_name +
            row.ascendancy +
            row.main_skill,
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
      cell: ({ row }) =>
        renderScore(row.original.total, undefined, currentEvent?.uses_medals),
      size: 120,
    },
    ...categoryNames.map((categoryName) => ({
      header: categoryName == "Personal Objectives" ? "P.O." : categoryName,
      accessorKey: categoryName,
      key: `column-${categoryName}`,
      // @ts-ignore
      cell: ({ row }) =>
        renderScore(
          row.original[categoryName as keyof RowDef] || 0,
          undefined,
          currentEvent?.uses_medals,
        ),
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
                        totalObjective.team_score[b.id].number() -
                        totalObjective.team_score[a.id].number()
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
                        const points = teamScore.totalPoints();
                        if (points === 0) {
                          continue;
                        }
                        const number = teamScore.number();
                        total += points;
                        values.push(number);
                        extra.push(points);
                      }
                      const cap =
                        totalObjective?.scoring_presets[0]?.point_cap || 0;
                      const current = Math.min(
                        totalObjective?.team_score[team.id]?.number() || 0,
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
      <div className="flex flex-col gap-2">
        {!isMobile && (
          <div className="flex flex-wrap justify-between gap-1">
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
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <MultiSelectPercentage
              name="uniques"
              options={Object.entries(itemMapping["unique"] || {}).map(
                ([name, idx]) => ({
                  label: name,
                  value: idx,
                }),
              )}
              onChange={setSelectedItems}
              placeholder="Filter by uniques"
              percentages={percentagePlayersWithItem}
              values={selectedItems}
              className="w-100"
            />
            <MultiSelectPercentage
              name="skills"
              options={Object.entries(itemMapping["gem"] || {}).map(
                ([skill, idx]) => ({
                  label: skill,
                  value: idx,
                }),
              )}
              onChange={setSelectedItems}
              placeholder="Filter by gem"
              percentages={percentagePlayersWithItem}
              values={selectedItems}
              className="w-100"
            />
          </div>
          {getTimeSelectOptions(currentEvent).length > 0 && (
            <Select
              className=""
              placeholder="Show ladder at..."
              options={getTimeSelectOptions(currentEvent)}
              onChange={(value: any) => {
                setHoursAfterEventStart(value);
              }}
            />
          )}
        </div>
        <Table
          data={filteredLadder?.sort((a, b) => a.rank - b.rank) || []}
          columns={ladderColumns}
          className="h-[70vh]"
        />
      </div>
    </>
  );
}
