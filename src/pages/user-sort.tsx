import { useContext, useEffect, useState } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { Form, Input, Space, Table } from "antd";
import { ColumnType } from "antd/es/table";
import ColumnGroup from "antd/es/table/ColumnGroup";
import Column from "antd/es/table/Column";
import { sortUsers } from "../utils/usersort";
import { ExpectedPlayTime, Permission, Signup } from "../client";
import { signupApi, teamApi } from "../client/client";

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
      const signups = Object.values(data).flatMap((x) => x);
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
  const userColumns: ColumnType<Signup>[] = [
    {
      title: "Name",
      dataIndex: ["user", "display_name"],
      key: "account_name",
      sorter: (a, b) => a.user.display_name.localeCompare(b.user.display_name),
      defaultSortOrder: "ascend",
    },
    {
      title: "PoE Name",
      dataIndex: ["user", "account_name"],
      key: "discord_name",
    },
    {
      title: "Expected Playtime",
      dataIndex: "expected_playtime",
      key: "expected_playtime",
      render: (expectedPlaytime: keyof typeof ExpectedPlayTime) =>
        ExpectedPlayTime[expectedPlaytime],
    },
    {
      title: "Assign Team",
      key: "assign_team",
      render: (signup) =>
        currentEvent.teams.map((team) => (
          // we are not using antd buttons here since the render takes about 3x as long which is significant here
          <button
            key={team.id + "-" + signup.user.id}
            className={
              signup.team_id !== team.id ? "btn btn-dash" : "btn btn-primary"
            }
            style={{ marginRight: "5px" }}
            onClick={() => {
              setSuggestions(
                suggestions.map((s) =>
                  s.user.id === signup.user.id ? { ...s, team_id: team.id } : s
                )
              );
            }}
          >
            {team.name.slice()}
          </button>
        )),
    },
  ];

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
      <Table dataSource={teamRows} size="small" pagination={false}>
        <Column title="Team" dataIndex="team" key="team" />
        <Column title="Members" dataIndex="members" key="members" />
        <ColumnGroup title="Playtime in hours per day">
          {Object.entries(ExpectedPlayTime).map((entry) => (
            <Column title={entry[1]} dataIndex={entry[0]} key={entry[0]} />
          ))}
        </ColumnGroup>
      </Table>
      <div className="divider divider-primary">{"Users"}</div>
      <Space style={{ marginBottom: "20px" }} wrap>
        <Form layout="inline">
          <Form.Item label="Filter by name">
            <Input
              allowClear
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value.toLowerCase())}
            />
          </Form.Item>
        </Form>
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
              .addUsersToTeams(currentEvent.id, suggestions)
              .then(updateSignups)
          }
        >
          Submit Assignments
        </button>
      </Space>
      <Table
        columns={userColumns}
        dataSource={suggestions
          .filter((s) => s.user.display_name.toLowerCase().includes(nameFilter))
          .map((s, index) => ({ ...s, key: `user-table-${index}` }))}
        size="small"
      />
    </div>
  );
};

export default UserSortPage;
