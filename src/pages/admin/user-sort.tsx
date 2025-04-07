import { useContext, useEffect, useMemo, useState } from "react";
import { GlobalStateContext } from "../../utils/context-provider";
import { sortUsers } from "../../utils/usersort";
import { Permission, Signup } from "../../client";
import { signupApi, teamApi } from "../../client/client";
import Table from "../../components/table";
import { ColumnDef } from "@tanstack/react-table";

type TeamRow = {
  key: number;
  team: string;
  members: number;
  "0-3": number;
  "4-6": number;
  "7-9": number;
  "10-12": number;
  "13+": number;
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

const UserSortPage = () => {
  const { user, currentEvent, setEventStatus, eventStatus } =
    useContext(GlobalStateContext);
  const [nameFilter, setNameFilter] = useState<string>("");
  const [signups, setSignups] = useState<Signup[]>([]);
  const [suggestions, setSuggestions] = useState<Signup[]>([]);

  function updateSignups() {
    if (!currentEvent) {
      return;
    }
    signupApi.getEventSignups(currentEvent.id).then((signups) => {
      setSignups(signups);
      if (!eventStatus) {
        return;
      }
      for (const signup of signups) {
        if (signup.user.id == user?.id) {
          setEventStatus({
            ...eventStatus,
            team_id: signup.team_id,
          });
          return;
        }
      }
    });
  }

  useEffect(() => setSuggestions(signups), [signups]);

  useEffect(updateSignups, [currentEvent]);
  const sortColumns = useMemo(() => {
    const columns: ColumnDef<Signup, any>[] = [
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
              teamApi
                .addUsersToTeams(currentEvent?.id || 0, [
                  {
                    user_id: row.original.user.id,
                    team_id: row.original.team_id,
                    is_team_lead: e.target.checked,
                  },
                ])
                .then(updateSignups);
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

  if (!user || !user.permissions.includes(Permission.admin) || !currentEvent) {
    return <div>You do not have permission to view this page</div>;
  }

  let teamRows = [...currentEvent.teams, { id: 0, name: "No team" }].map(
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
            return acc;
          },
          {
            key: team.id,
            team: team.name,
            members: suggestions.filter((signup) => signup.team_id === team.id)
              .length,
          } as TeamRow
        )
  );

  const totalRow = teamRows.reduce(
    (acc, row) => {
      acc["0-3"] = (row["0-3"] ?? 0) + (acc["0-3"] ?? 0);
      acc["4-6"] = (row["4-6"] ?? 0) + (acc["4-6"] ?? 0);
      acc["7-9"] = (row["7-9"] ?? 0) + (acc["7-9"] ?? 0);
      acc["10-12"] = (row["10-12"] ?? 0) + (acc["10-12"] ?? 0);
      acc["13+"] = (row["13+"] ?? 0) + (acc["13+"] ?? 0);
      acc.members += row.members;
      return acc;
    },
    {
      team: "Total Signups",
      members: 0,
      key: -1,
    } as TeamRow
  );
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
            </tr>
          ))}
        </tbody>
      </table>
      <div className="divider divider-primary">Users</div>
      <div className="flex gap-2 bg-base-300 p-4 wrap mb-2">
        <label className="input">
          <span className="label">Filter by name:</span>
          <input
            type="text"
            onChange={(e) => setNameFilter(e.target.value.toLowerCase())}
          />
        </label>
        <button
          className="btn"
          onClick={() => {
            const time = new Date().getTime();
            setSuggestions(sortUsers(currentEvent, signups));
            console.log("Sort took: ", new Date().getTime() - time + "ms");
          }}
        >
          Get Sort Suggestions
        </button>
        <button className="btn" onClick={() => setSuggestions(signups)}>
          Reset Suggestions
        </button>
        <button
          className="btn"
          onClick={() => {
            setSignups(signups.map((s) => ({ ...s, team_id: 0 })));
          }}
        >
          Reset Everything
        </button>
        <button
          className="btn btn-warning"
          onClick={() =>
            teamApi
              .addUsersToTeams(
                currentEvent.id,
                suggestions.map((s) => {
                  return {
                    user_id: s.user.id,
                    team_id: s.team_id || 0,
                    is_team_lead: s.team_lead,
                  };
                })
              )
              .then(updateSignups)
          }
        >
          Submit Assignments
        </button>
      </div>
      <Table
        data={suggestions.filter(
          (signup) =>
            signup.user.display_name.toLowerCase().includes(nameFilter) ||
            signup.user.account_name?.toLowerCase().includes(nameFilter)
        )}
        columns={sortColumns}
      />
    </div>
  );
};

export default UserSortPage;
