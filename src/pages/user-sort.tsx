import React, { useContext } from "react";
import { UserPermission } from "../types/user";
import { GlobalStateContext } from "../utils/context-provider";
import { Button, Divider, Form, Input, Space, Table } from "antd";
import { PlayTime, Signup } from "../types/signup";
import { assignUsersToTeams, fetchAllSignups } from "../client/signup-client";
import { ColumnType } from "antd/es/table";
import ColumnGroup from "antd/es/table/ColumnGroup";
import Column from "antd/es/table/Column";
import { sortUsers } from "../utils/usersort";

type TeamRow = {
  key: number;
  team: string;
  members: number;
  [PlayTime.VERY_LOW]: number;
  [PlayTime.LOW]: number;
  [PlayTime.MEDIUM]: number;
  [PlayTime.HIGH]: number;
  [PlayTime.VERY_HIGH]: number;
  [PlayTime.EXTREME]: number;
  [PlayTime.NO_LIFE]: number;
};

const UserSortPage: React.FC = () => {
  const { user, currentEvent, setEventStatus, eventStatus } =
    useContext(GlobalStateContext);
  const [nameFilter, setNameFilter] = React.useState<string>("");
  const [signups, setSignups] = React.useState<Signup[]>([]);
  const [suggestions, setSuggestions] = React.useState<Signup[]>([]);

  function updateSignups() {
    if (!currentEvent) {
      return;
    }
    fetchAllSignups(currentEvent.id).then((data) => {
      setSignups(data);
      if (!eventStatus) {
        return;
      }
      for (const signup of data) {
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

  React.useEffect(() => setSuggestions(signups), [signups]);

  React.useEffect(updateSignups, [currentEvent]);
  if (
    !user ||
    !user.permissions.includes(UserPermission.ADMIN) ||
    !currentEvent
  ) {
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
      render: (expectedPlaytime: keyof typeof PlayTime) =>
        PlayTime[expectedPlaytime],
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
              signup.team_id !== team.id ? "secondary-button" : "primary-button"
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
      (Object.keys(PlayTime) as PlayTime[]).forEach((key) => {
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
      <h1>Sort</h1>
      <Divider>Teams</Divider>
      <Table dataSource={teamRows} size="small" pagination={false}>
        <Column title="Team" dataIndex="team" key="team" />
        <Column title="Members" dataIndex="members" key="members" />
        <ColumnGroup title="Playtime in hours per day">
          {Object.entries(PlayTime).map((entry) => (
            <Column title={entry[1]} dataIndex={entry[0]} key={entry[0]} />
          ))}
        </ColumnGroup>
      </Table>
      <Divider>Users</Divider>

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
        <Button
          onClick={() => {
            const time = new Date().getTime();
            setSuggestions(sortUsers(currentEvent, signups));
            console.log("Sort took: ", new Date().getTime() - time + "ms");
          }}
        >
          Get Sort Suggestions
        </Button>
        <Button onClick={() => setSuggestions(signups)}>
          Reset Suggestions
        </Button>
        <Button
          onClick={() => {
            setSignups(signups.map((s) => ({ ...s, team_id: 0 })));
          }}
        >
          Reset Everything
        </Button>
        <Button
          type="primary"
          onClick={() =>
            assignUsersToTeams(currentEvent.id, suggestions).then(updateSignups)
          }
        >
          Submit Assignments
        </Button>
        {/* </div> */}
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
