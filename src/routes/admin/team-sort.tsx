import { ExtendedSignup, Permission, Signup } from "@client/api";
import {
  useAddUsersToTeams,
  useDeleteSignup,
  useGetSignups,
} from "@client/query";
import { DeleteButton } from "@components/form/delete-button";
import Table from "@components/table/table";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { GlobalStateContext } from "@utils/context-provider";
import { renderConditionally } from "@utils/token";
import { sortUsers, type SortBucketConfig } from "@utils/usersort";
import { useContext, useEffect, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";

export const Route = createFileRoute("/admin/team-sort")({
  component: renderConditionally(UserSortPage, [
    Permission.admin,
    Permission.manager,
  ]),
});

type TeamRow = {
  key: number;
  team: string;
  members: number;
  new: number;
  experienced: number;
  veteran: number;
  low: number;
  medium: number;
  large: number;
};

export type SortedSignup = ExtendedSignup & {
  sorted?: boolean;
};

const totalBucketKey = "total";
const participationBucketKeys = {
  new: "participation:new",
  experienced: "participation:experienced",
  veteran: "participation:veteran",
} as const;
const playtimeBucketKeys = {
  low: "playtime:low",
  medium: "playtime:medium",
  large: "playtime:large",
} as const;

function getParticipationBucket(
  signup: ExtendedSignup,
): "new" | "experienced" | "veteran" {
  const participatedEvents = Object.keys(
    signup.highest_character_levels || {},
  ).length;
  if (participatedEvents === 0) {
    return "new";
  }
  if (participatedEvents < 5) {
    return "experienced";
  }
  return "veteran";
}

function getLastEventId(signups: ExtendedSignup[]): number | null {
  let lastEventId: number | null = null;
  for (const signup of signups) {
    for (const key of Object.keys(
      signup.playtimes_in_last_events_per_day_in_hours,
    )) {
      const parsed = Number.parseInt(key, 10);
      if (!Number.isNaN(parsed)) {
        lastEventId =
          lastEventId === null ? parsed : Math.max(lastEventId, parsed);
      }
    }
  }
  return lastEventId;
}

function getPlaytimeBucket(
  signup: ExtendedSignup,
  lastEventId: number | null,
): "low" | "medium" | "large" | null {
  if (lastEventId === null) {
    return null;
  }
  const playtime =
    signup.playtimes_in_last_events_per_day_in_hours[String(lastEventId)] || 0;
  if (playtime <= 0) {
    return null;
  }
  if (playtime < 3) {
    return "low";
  }
  if (playtime < 8) {
    return "medium";
  }
  return "large";
}

function buildBucketConfig(signups: ExtendedSignup[]): SortBucketConfig {
  const lastEventId = getLastEventId(signups);
  const bucketKeys = [
    totalBucketKey,
    participationBucketKeys.new,
    participationBucketKeys.experienced,
    participationBucketKeys.veteran,
    playtimeBucketKeys.low,
    playtimeBucketKeys.medium,
    playtimeBucketKeys.large,
  ];

  return {
    bucketKeys,
    totalBucketKey,
    getSignupBuckets: (signup: ExtendedSignup) => {
      const buckets = [
        totalBucketKey,
        participationBucketKeys[getParticipationBucket(signup)],
      ];
      const playtimeBucket = getPlaytimeBucket(signup, lastEventId);
      if (playtimeBucket) {
        buckets.push(playtimeBucketKeys[playtimeBucket]);
      }
      return buckets;
    },
  };
}

function UserSortPage() {
  const { currentEvent } = useContext(GlobalStateContext);
  const [nameFilter, setNameFilter] = useState<string>("");
  const [nameListFilter, setNameListFilter] = useState<string[]>([]);
  const qc = useQueryClient();
  const { signups = [], isLoading, isError } = useGetSignups(currentEvent.id);
  const { deleteSignup } = useDeleteSignup(qc);
  const userIdToSignupMap = signups.reduce(
    (acc, signup) => {
      acc[signup.user.id] = signup;
      return acc;
    },
    {} as Record<number, ExtendedSignup>,
  );
  const { addUsersToTeams } = useAddUsersToTeams(qc);
  const [suggestions, setSuggestions] = useState<SortedSignup[]>([]);
  const signupsKey = useMemo(
    () =>
      signups
        .map(
          (signup) =>
            `${signup.user.id}:${signup.team_id ?? ""}:${signup.team_lead ? 1 : 0}`,
        )
        .join("|"),
    [signups],
  );
  useEffect(() => {
    if (signups) {
      setSuggestions([...signups]);
    }
  }, [signupsKey]);
  let count = 0;
  const partnerMap = new Map<number, number>();
  const signupMap = new Map<number, ExtendedSignup>();
  for (const signup of signups) {
    signupMap.set(signup.user.id, signup);
  }
  const lastEventId = useMemo(() => getLastEventId(suggestions), [suggestions]);
  for (const signup of signups) {
    if (signup.partner_id) {
      const partner = signupMap.get(signup.partner_id);
      if (!partner || partner.partner_id !== signup.user.id) {
        continue;
      }
      if (!partnerMap.has(signup.partner_id)) {
        partnerMap.set(signup.user.id, count);
        partnerMap.set(signup.partner_id, count);
        count++;
      } else {
        partnerMap.set(signup.user.id, partnerMap.get(signup.partner_id)!);
      }
    }
  }

  const sortColumns = useMemo(() => {
    const columns: ColumnDef<ExtendedSignup>[] = [
      // {
      //   header: "Partners",
      //   accessorFn: (row) => partnerMap.get(row.user.id),
      //   size: 120,
      // },
      {
        header: "ID",
        accessorFn: (row) => row.user.id,
        size: 100,
      },
      {
        header: "PoE Name",
        accessorKey: "user.account_name",
        size: 200,
      },
      {
        header: "#BPLs",
        accessorFn: (row) =>
          Object.keys(row.highest_character_levels || {}).length,
        size: 140,
      },
      {
        header: "Playtime last BPL",
        accessorFn: (row) =>
          lastEventId === null
            ? ""
            : row.playtimes_in_last_events_per_day_in_hours[
                String(lastEventId)
              ] || 0,
        cell: ({ getValue }) => {
          const playtime = getValue() as number;
          return playtime ? playtime.toFixed(1) + " h / day" : "N/A";
        },
        size: 200,
      },
      // {
      //   header: "GuildLead",
      //   size: 150,
      //   accessorKey: "extra",
      //   cell: ({ row }) => {
      //     return row.original.extra ? (
      //       <CheckCircleIcon className="size-8 text-success" />
      //     ) : (
      //       <XCircleIcon className="size-8 text-error" />
      //     );
      //   },
      // },
      {
        header: "Lead",
        accessorKey: "team_lead",
        cell: ({ row }) => (
          <input
            className="checkbox checkbox-primary"
            type="checkbox"
            defaultChecked={row.original.team_lead}
            onChange={(e) => {
              setSuggestions(
                suggestions.map((signup) =>
                  signup.user.id === row.original.user.id
                    ? { ...signup, team_lead: e.target.checked }
                    : signup,
                ),
              );
              addUsersToTeams({
                eventId: currentEvent?.id || 0,
                users: [
                  {
                    user_id: row.original.user.id,
                    team_id: row.original.team_id,
                    is_team_lead: e.target.checked,
                  },
                ],
              });
            }}
          />
        ),
        size: 100,
      },
      {
        header: "Assign Team",
        accessorKey: "team_id",
        size: 450,
        cell: ({ row }) => {
          return (
            <div className="flex flex-wrap gap-1">
              {currentEvent?.teams.map((team) => (
                <button
                  key={team.id + "-" + row.original.user.id}
                  className={twMerge(
                    "btn btn-sm",
                    row.original.team_id === team.id
                      ? "btn-primary"
                      : "btn-dash hover:bg-base-300",
                  )}
                  onClick={() => {
                    if (row.original.team_id === team.id) {
                      setSuggestions(
                        suggestions.map((signup) =>
                          signup.user.id === row.original.user.id
                            ? {
                                ...signup,
                                team_id: undefined,
                                team_lead: false,
                              }
                            : signup,
                        ),
                      );
                    } else {
                      setSuggestions(
                        suggestions.map((signup) =>
                          signup.user.id === row.original.user.id
                            ? {
                                ...signup,
                                team_id: team.id,
                                team_lead: row.original.team_lead,
                              }
                            : signup,
                        ),
                      );
                    }
                  }}
                >
                  {team.name.slice()}
                </button>
              ))}
            </div>
          );
        },
      },
      {
        header: "",
        accessorKey: "user.id",
        cell: ({ row }) => {
          return (
            <DeleteButton
              onDelete={() => {
                deleteSignup({
                  eventId: currentEvent.id,
                  userId: row.original.user.id,
                });
              }}
              className="btn-sm"
            ></DeleteButton>
          );
        },
        enableSorting: false,
      },
    ];
    return columns;
  }, [currentEvent, suggestions, partnerMap]);

  if (isError) {
    return <div>Error loading signups</div>;
  }
  if (isLoading) {
    return <div className="loading loading-lg loading-spinner"></div>;
  }

  let teamRows = [...currentEvent.teams, { id: null, name: "No team" }].map(
    (team) =>
      suggestions
        .filter((signup) => signup.team_id === team.id)
        .reduce(
          (acc, signup) => {
            const participationBucket = getParticipationBucket(signup);
            acc[participationBucket] += 1;
            const playtimeBucket = getPlaytimeBucket(signup, lastEventId);
            if (playtimeBucket) {
              acc[playtimeBucket] += 1;
            }

            return acc;
          },
          {
            key: team.id,
            team: team.name,
            members: suggestions.filter((signup) => signup.team_id === team.id)
              .length,
            new: 0,
            experienced: 0,
            veteran: 0,
            low: 0,
            medium: 0,
            large: 0,
          } as TeamRow,
        ),
  );

  const totalRow = teamRows.reduce(
    (acc, row) => {
      for (const key of [
        "new",
        "experienced",
        "veteran",
        "low",
        "medium",
        "large",
        "members",
      ]) {
        // @ts-ignore
        if (!acc[key]) {
          // @ts-ignore
          acc[key] = 0;
        }
        // @ts-ignore
        acc[key] += row[key] || 0;
      }
      return acc;
    },
    {
      team: "Total Signups",
      members: 0,
      key: -1,
      new: 0,
      experienced: 0,
      veteran: 0,
      low: 0,
      medium: 0,
      large: 0,
    } as TeamRow,
  );
  const exportToCSV = (signups: Signup[]) => {
    if (!signups.length) return;
    const headers = [
      "Team",
      "Timestamp",
      "Display Name",
      "Account Name",
      "Discord Name",
      "Discord ID",
      "Expected Playtime",
      "Needs Help",
      "Wants to Help",
      "Team Lead",
      "Partner",
    ];
    const teamMap = currentEvent.teams.reduce(
      (acc, team) => {
        acc[team.id] = team.name;
        return acc;
      },
      {} as Record<number, string>,
    );
    const rows = signups
      .sort((a, b) => (a.team_id || 0) - (b.team_id || 0))
      .map((signup) => [
        teamMap[signup.team_id || 0] || "No team",
        signup.timestamp,
        signup.user.display_name,
        signup.user.account_name || "",
        signup.user.discord_name || "",
        signup.user.discord_id || "",
        signup.expected_playtime,
        signup.needs_help ? "X" : "",
        signup.wants_to_help ? "X" : "",
        signup.team_lead ? "X" : "",
        userIdToSignupMap[signup.partner_id || 0]?.user.account_name || "",
      ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Signups_${(currentEvent?.name || "event").replaceAll(" ", "-")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  teamRows = [totalRow, ...teamRows];
  return (
    <div className="mt-4">
      <div className="divider divider-primary">Teams</div>
      <table className="table-striped table">
        <thead className="bg-base-200">
          <tr>
            <th rowSpan={2}>Team</th>
            <th rowSpan={2}>Members</th>
            <th colSpan={3} className="text-center">
              Participation
            </th>
            <th colSpan={3} className="text-center">
              Playtime per day (last event)
            </th>
          </tr>
          <tr>
            <th>
              <div className="tooltip" data-tip="0 events">
                New
              </div>
            </th>
            <th>
              <div className="tooltip" data-tip="1-4 events">
                Experienced
              </div>
            </th>
            <th>
              <div className="tooltip" data-tip="5+ events">
                Veteran
              </div>
            </th>
            <th>
              <div className="tooltip" data-tip="<3 hours/day">
                Low
              </div>
            </th>
            <th>
              <div className="tooltip" data-tip="3-8 hours/day">
                Medium
              </div>
            </th>
            <th>
              <div className="tooltip" data-tip="8+ hours/day">
                Large
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-base-300">
          {teamRows.map((row) => (
            <tr key={row.key}>
              <td>{row.team}</td>
              <td>{row.members}</td>
              <td>{row.new}</td>
              <td>{row.experienced}</td>
              <td>{row.veteran}</td>
              <td>{row.low}</td>
              <td>{row.medium}</td>
              <td>{row.large}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="divider divider-primary">Users</div>
      <div className="wrap mb-2 flex gap-2 bg-base-300 p-4">
        <button
          className="btn btn-primary"
          onClick={() => exportToCSV(signups)}
        >
          <ArrowDownTrayIcon className="mr-2 size-4" />
          CSV
        </button>

        <label className="input">
          <span className="label">Filter by name:</span>
          <input
            type="text"
            onChange={(e) => setNameFilter(e.target.value.toLowerCase())}
          />
        </label>
        <label className="input">
          <span className="label">Multifilter</span>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setNameListFilter(
                new FormData(e.currentTarget)
                  .get("nameList")
                  ?.toString()
                  .split(" ") || [],
              );
            }}
          >
            <input type="text" name="nameList" />
          </form>
        </label>
        <button
          className="btn btn-outline"
          onClick={() => {
            const time = new Date().getTime();
            setSuggestions(
              sortUsers(currentEvent, signups, buildBucketConfig(signups)),
            );
            console.log("Sort took: ", new Date().getTime() - time + "ms");
          }}
        >
          Get Sort Suggestions
        </button>
        <button
          className="btn btn-outline"
          onClick={() => setSuggestions(signups)}
        >
          Reset Suggestions
        </button>
        {/* <button
          className="btn btn-outline"
          onClick={() => {
            setSuggestions(signups.map((s) => ({ ...s, team_id: undefined })));
          }}
        >
          Reset Everything
        </button> */}
        <button
          className="btn btn-warning"
          onClick={() => {
            addUsersToTeams({
              eventId: currentEvent.id,
              users: suggestions.map((s) => {
                return {
                  user_id: s.user.id,
                  team_id: s.team_id || 0,
                  is_team_lead: s.team_lead,
                };
              }),
            });
          }}
        >
          Submit Assignments
        </button>
      </div>
      <Table
        data={suggestions
          .sort((a, b) => {
            const aPartnerGroup = partnerMap.get(a.user.id) ?? -1;
            const bPartnerGroup = partnerMap.get(b.user.id) ?? -1;
            if (aPartnerGroup !== bPartnerGroup) {
              return -aPartnerGroup + bPartnerGroup;
            }

            return b.user.id - a.user.id;
          })
          .filter((signup) => {
            if (nameFilter === "" && nameListFilter.length === 0) {
              return true;
            }
            return (
              (signup.user.display_name.toLowerCase().includes(nameFilter) ||
                signup.user.account_name?.toLowerCase().includes(nameFilter)) &&
              (nameListFilter.length === 0 ||
                nameListFilter.some(
                  (name) =>
                    signup.user.account_name?.toLowerCase().split("#")[0] ===
                    name.toLowerCase().split("#")[0],
                ))
            );
          })}
        columns={sortColumns}
        className="h-[70vh]"
      />
    </div>
  );
}

export default UserSortPage;
