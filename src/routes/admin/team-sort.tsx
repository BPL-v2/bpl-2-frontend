import { createFileRoute } from "@tanstack/react-router";
import { useContext, useEffect, useMemo, useState } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import { sortUsers } from "@utils/usersort";
import { Permission, Signup } from "@client/api";
import Table from "@components/table";
import { ColumnDef } from "@tanstack/react-table";
import { renderConditionally } from "@utils/token";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import { useAddUsersToTeams, useGetSignups } from "@client/query";
import { useQueryClient } from "@tanstack/react-query";

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
  "0-3": number;
  "4-6": number;
  "7-9": number;
  "10-12": number;
  "13+": number;
  total: number;
};

function toExpectedPlayTime(
  expectedPlaytime: number
): "0-3" | "4-6" | "7-9" | "10-12" | "13+" {
  if (expectedPlaytime < 4) {
    return "0-3";
  } else if (expectedPlaytime < 7) {
    return "4-6";
  } else if (expectedPlaytime < 10) {
    return "7-9";
  } else if (expectedPlaytime < 13) {
    return "10-12";
  } else {
    return "13+";
  }
}

function UserSortPage() {
  const { currentEvent } = useContext(GlobalStateContext);
  const [nameFilter, setNameFilter] = useState<string>("");
  const [nameListFilter, setNameListFilter] = useState<string[]>([]);
  const qc = useQueryClient();
  const {
    signups = [],
    isLoading,
    isError,
  } = useGetSignups(currentEvent.id || 0);
  const { addUsersToTeams } = useAddUsersToTeams(qc);
  const [suggestions, setSuggestions] = useState<Signup[]>([]);
  useEffect(() => {
    if (signups) {
      setSuggestions([...signups]);
    }
  }, [signups]);

  const sortColumns = useMemo(() => {
    const columns: ColumnDef<Signup>[] = [
      {
        header: "Name",
        accessorKey: "user.display_name",
        size: 200,
      },
      {
        header: "PoE Name",
        accessorKey: "user.account_name",
        size: 200,
      },
      {
        header: "Expected Playtime",
        accessorKey: "expected_playtime",
        size: 250,
      },
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
                    : signup
                )
              );
              addUsersToTeams({
                event_id: currentEvent?.id || 0,
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
        size: 200,
      },
      {
        header: "Assign Team",
        size: 600,
        cell: ({ row }) => {
          return currentEvent?.teams.map((team) => (
            <button
              key={team.id + "-" + row.original.user.id}
              className={
                row.original.team_id !== team.id
                  ? "btn btn-dash"
                  : "btn btn-primary"
              }
              style={{ marginRight: "5px" }}
              onClick={() => {
                if (row.original.team_id) {
                  setSuggestions(
                    suggestions.map((signup) =>
                      signup.user.id === row.original.user.id
                        ? { ...signup, team_id: undefined, team_lead: false }
                        : signup
                    )
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
                        : signup
                    )
                  );
                }
              }}
            >
              {team.name.slice()}
            </button>
          ));
        },
      },
    ];
    return columns;
  }, [currentEvent, suggestions]);

  if (isError) {
    return <div>Error loading signups</div>;
  }
  if (isLoading) {
    return <div className="loading loading-spinner loading-lg"></div>;
  }

  let teamRows = [...currentEvent.teams, { id: null, name: "No team" }].map(
    (team) =>
      suggestions
        .filter((signup) => signup.team_id === team.id)
        .reduce(
          (acc, signup) => {
            const expectedPlaytime = toExpectedPlayTime(
              signup.expected_playtime
            );
            if (!acc[expectedPlaytime]) {
              acc[expectedPlaytime] = 0;
            }
            acc[expectedPlaytime] += 1;
            acc.total += signup.expected_playtime;

            return acc;
          },
          {
            key: team.id,
            team: team.name,
            members: suggestions.filter((signup) => signup.team_id === team.id)
              .length,
            total: 0,
          } as TeamRow
        )
  );

  const totalRow = teamRows.reduce(
    (acc, row) => {
      for (const key of ["0-3", "4-6", "7-9", "10-12", "13+", "members"]) {
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
    } as TeamRow
  );
  const exportToCSV = (signups: Signup[]) => {
    if (!signups.length) return;
    const headers = [
      "Team",
      "Display Name",
      "Account Name",
      "Expected Playtime",
      "Needs Help",
      "Wants to Help",
      "Team Lead",
    ];
    const teamMap = currentEvent.teams.reduce(
      (acc, team) => {
        acc[team.id] = team.name;
        return acc;
      },
      {} as Record<number, string>
    );
    const rows = signups
      .sort((a, b) => (a.team_id || 0) - (b.team_id || 0))
      .map((signup) => [
        teamMap[signup.team_id || 0] || "No team",
        signup.user.display_name,
        signup.user.account_name || "",
        signup.expected_playtime,
        signup.needs_help ? "X" : "",
        signup.wants_to_help ? "X" : "",
        signup.team_lead ? "X" : "",
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
      `Signups_${(currentEvent?.name || "event").replaceAll(" ", "-")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  teamRows = [totalRow, ...teamRows];
  return (
    <div style={{ marginTop: "20px" }}>
      <h1>Sort</h1> <div className="divider divider-primary">Teams</div>
      <table className="table table-striped">
        <thead className="bg-base-200">
          <tr>
            <th rowSpan={2}>Team</th>
            <th rowSpan={2}>Members</th>
            <th colSpan={5} className="text-center">
              Playtime in hours per day
            </th>
            <th rowSpan={2}>Total</th>
          </tr>
          <tr>
            <th>0-3</th>
            <th>4-6</th>
            <th>7-9</th>
            <th>10-12</th>
            <th>13+</th>
          </tr>
        </thead>
        <tbody className="bg-base-300">
          {teamRows.map((row) => (
            <tr key={row.key}>
              <td>{row.team}</td>
              <td>{row.members}</td>
              <td>{row["0-3"]}</td>
              <td>{row["4-6"]}</td>
              <td>{row["7-9"]}</td>
              <td>{row["10-12"]}</td>
              <td>{row["13+"]}</td>
              <td>{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="divider divider-primary">Users</div>
      <div className="flex gap-2 bg-base-300 p-4 wrap mb-2">
        <button
          className="btn btn-primary "
          onClick={() => exportToCSV(signups)}
        >
          <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
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
                  .split(" ") || []
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
            setSuggestions(sortUsers(currentEvent, signups));
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
        <button
          className="btn btn-outline"
          onClick={() => {
            setSuggestions(signups.map((s) => ({ ...s, team_id: undefined })));
          }}
        >
          Reset Everything
        </button>
        <button
          className="btn btn-warning"
          onClick={() => {
            addUsersToTeams({
              event_id: currentEvent.id,
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
          .sort((a, b) => a.id - b.id)
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
                    name.toLowerCase().split("#")[0]
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
