import React, { useContext } from "react";
import { CrudColumn } from "../components/crudtable";
import { UserPermission } from "../types/user";
import { GlobalStateContext } from "../utils/context-provider";
import { Button, Form, Input, Select, Table } from "antd";
import { PlayTime, Signup } from "../types/signup";
import { assignUsersToTeams, fetchAllSignups } from "../client/signup-client";

const UserSortPage: React.FC = () => {
  const { user, currentEvent } = useContext(GlobalStateContext);
  const [nameFilter, setNameFilter] = React.useState<string>("");
  const [roleFilter, setRoleFilter] = React.useState<UserPermission | "">("");
  const [signups, setSignups] = React.useState<Signup[]>([]);

  function updateSignups() {
    if (!currentEvent) {
      return;
    }
    fetchAllSignups(currentEvent.id).then((data) => setSignups(data));
  }
  React.useEffect(updateSignups, [currentEvent]);
  if (
    !user ||
    !user.permissions.includes(UserPermission.ADMIN) ||
    !currentEvent
  ) {
    return <div>You do not have permission to view this page</div>;
  }
  const columns: CrudColumn<Signup>[] = [
    {
      title: "Name",
      dataIndex: ["user", "display_name"],
      key: "account_name",
      type: "text",
    },
    {
      title: "PoE Name",
      dataIndex: ["user", "account_name"],
      key: "discord_name",
      type: "text",
    },
    {
      title: "Expected Playtime",
      dataIndex: "expected_playtime",
      key: "expected_playtime",
      render: (expectedPlaytime: keyof typeof PlayTime) =>
        PlayTime[expectedPlaytime],
    },
    {
      title: "Team",
      dataIndex: ["team_id"],
      key: "team_id",
      render: (teamId) =>
        currentEvent.teams.find((team) => team.id === teamId)?.name,
      sorter: (a, b) => a.team_id ?? 0 - (b.team_id ?? 0),
    },
    {
      title: "Assign Team",
      key: "assign_team",
      render: (signup) =>
        currentEvent.teams.map((team) => {
          return (
            <Button
              style={{ marginRight: "5px" }}
              onClick={() => {
                assignUsersToTeams(currentEvent.id, [
                  { user_id: signup.user.id, team_id: team.id },
                ]).then(updateSignups);
              }}
            >
              {team.name.slice(0, 4)}
            </Button>
          );
        }),
    },
  ];

  // const fetchFunc = () => fetchAllSignups(5);
  // useMemo(() => {
  //   fetchFunc = () => fetchAllSignups(currentEvent.id);
  // } , [currentEvent.id]);
  return (
    <div style={{ marginTop: "20px" }}>
      <h1>Sort</h1>
      <Form layout="inline" style={{ marginBottom: "20px" }}>
        <Form.Item label="Filter by name">
          <Input
            allowClear
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value.toLowerCase())}
          />
        </Form.Item>
        <Form.Item label="Filter by role" style={{ width: "300px" }}>
          <Select
            value={roleFilter}
            onChange={(value) => setRoleFilter(value)}
            allowClear
          >
            <Select.Option key="all" value={""}>
              All
            </Select.Option>
            {Object.values(UserPermission).map((role) => (
              <Select.Option key={role} value={role}>
                {role}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
      <Table columns={columns} dataSource={signups} />
    </div>
  );
};

export default UserSortPage;
