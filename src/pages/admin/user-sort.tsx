import { useContext, useEffect, useState } from "react";
import { GlobalStateContext } from "../../utils/context-provider";
import { sortUsers } from "../../utils/usersort";
import { ExpectedPlayTime, Permission, Signup } from "../../client";
import { signupApi, teamApi } from "../../client/client";

type TeamRow = {
  key: number;
  team: string;
  members: number;
  [ExpectedPlayTime.VERY_LOW]: number;
  [ExpectedPlayTime.LOW]: number;
  [ExpectedPlayTime.MEDIUM]: number;
  [ExpectedPlayTime.HIGH]: number;
  [ExpectedPlayTime.VERY_HIGH]: number;
  [ExpectedPlayTime.EXTREME]: number;
  [ExpectedPlayTime.NO_LIFE]: number;
};

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
    signupApi.getEventSignups(currentEvent.id).then((data) => {
      const signups = Object.entries(data)
        .map(([key, value]) =>
          value.map((value) => {
            return { ...value, team_id: parseInt(key) };
          })
        )
        .flat();
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
  if (!user || !user.permissions.includes(Permission.admin) || !currentEvent) {
    return <div>You do not have permission to view this page</div>;
  }

  let teamRows = [...currentEvent.teams, { id: 0, name: "No team" }].map(
    (team) =>
      suggestions
        .filter((signup) => signup.team_id === team.id)
        .reduce(
          (acc, signup) => {
            if (!acc[signup.expected_playtime]) {
              acc[signup.expected_playtime] = 0;
            }
            acc[signup.expected_playtime] += 1;
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
      (Object.keys(ExpectedPlayTime) as ExpectedPlayTime[]).forEach((key) => {
        if (!acc[key]) {
          acc[key] = 0;
        }
        acc[key] += row[key] ?? 0;
      });
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
      <h1>Sort</h1> <div className="divider divider-primary">{"Teams"}</div>
      <table className="table table-striped">
        <thead className="bg-base-200">
          <tr>
            <th rowSpan={2}>Team</th>
            <th rowSpan={2}>Members</th>
            <th
              colSpan={Object.values(ExpectedPlayTime).length}
              className="text-center"
            >
              Playtime in hours per day
            </th>
          </tr>
          <tr>
            {Object.values(ExpectedPlayTime).map((time) => (
              <th key={time}>{time}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-base-300">
          {teamRows.map((row) => (
            <tr key={row.key}>
              <td>{row.team}</td>
              <td>{row.members}</td>
              {Object.keys(ExpectedPlayTime).map((key) => (
                // @ts-ignore
                <td key={key}>{row[key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="divider divider-primary">{"Users"}</div>
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
                  return { user_id: s.user.id, team_id: s.team_id || 0 };
                })
              )
              .then(updateSignups)
          }
        >
          Submit Assignments
        </button>
      </div>
      <table className="table table-md">
        <thead className="bg-base-200">
          <tr>
            <th>Name</th>
            <th>PoE Name</th>
            <th>Expected Playtime</th>
            <th>Assign Team</th>
          </tr>
        </thead>
        <tbody className="bg-base-300">
          {suggestions
            .filter((s) =>
              s.user.display_name.toLowerCase().includes(nameFilter)
            )
            .map((s, index) => (
              <tr key={index}>
                <td>{s.user.display_name}</td>
                <td>{s.user.account_name}</td>
                <td>{ExpectedPlayTime[s.expected_playtime]}</td>
                <td>
                  {currentEvent.teams.map((team) => (
                    <button
                      key={team.id + "-" + s.user.id}
                      className={
                        s.team_id !== team.id
                          ? "btn btn-dash"
                          : "btn btn-primary"
                      }
                      style={{ marginRight: "5px" }}
                      onClick={() => {
                        setSuggestions(
                          suggestions.map((signup) =>
                            signup.user.id === s.user.id
                              ? { ...signup, team_id: team.id }
                              : signup
                          )
                        );
                      }}
                    >
                      {team.name.slice()}
                    </button>
                  ))}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserSortPage;
