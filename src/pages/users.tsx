import React, { useContext } from "react";
import CrudTable, { CrudColumn } from "../components/crudtable";
import { GlobalStateContext } from "../utils/context-provider";
import { Permission, User } from "../client";
import { userApi } from "../client/client";
import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";

const columns: CrudColumn<User>[] = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    type: "number",
  },
  {
    title: "Name",
    dataIndex: "display_name",
    key: "display_name",
    type: "text",
  },
  {
    title: "PoE Name",
    dataIndex: "account_name",
    key: "account_name",
    type: "text",
  },
  {
    title: "Discord Name",
    dataIndex: "discord_name",
    key: "discord_name",
    type: "text",
  },
  {
    title: "Discord ID",
    dataIndex: "discord_id",
    key: "discord_id",
    type: "number",
    render: (value: number) => {
      return (
        <a onClick={() => copyDiscordId(value)} className="flex gap-2">
          <ClipboardDocumentCheckIcon className="cursor-pointer h-6 w-6" />
          {value}
        </a>
      );
    },
  },
  {
    title: "Permissions",
    dataIndex: "permissions",
    key: "permissions",
    type: "multiselect",
    render: (value: Permission[]) => {
      return value.join(", ");
    },
    options: Object.values(Permission),
    editable: true,
  },
];

function copyDiscordId(value: number) {
  navigator.clipboard.writeText("<@" + value.toString() + ">");
}

const UserPage: React.FC = () => {
  const { user } = useContext(GlobalStateContext);
  const [nameFilter, setNameFilter] = React.useState<string>("");
  const [roleFilter, _] = React.useState<Permission | "">("");
  if (!user || !user.permissions.includes(Permission.admin)) {
    return <div>You do not have permission to view this page</div>;
  }
  return (
    <div style={{ marginTop: "20px" }}>
      <h1>Users</h1>
      <div className="m-2 flex gap-2 bg-base-300 p-4">
        <label className="input">
          <span className="label">Filter by name</span>
          <input
            type="text"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value.toLowerCase())}
          />
        </label>
        <label className="select">
          <span className="label">Filter by role</span>
          <select>
            <option value="">All</option>
            {Object.values(Permission).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>
      </div>
      {/* <Form layout="inline" style={{ marginBottom: "20px" }}>
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
            {Object.values(Permission).map((role) => (
              <Select.Option key={role} value={role}>
                {role}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form> */}
      <CrudTable<User>
        resourceName="User"
        columns={columns}
        fetchFunction={userApi.getAllUsers}
        editFunction={(user: User) =>
          userApi.changePermissions(user.id, user.permissions)
        }
        filterFunction={(user) =>
          !!(
            user.display_name?.toLowerCase().includes(nameFilter) ||
            user.account_name?.toLowerCase().includes(nameFilter) ||
            user.discord_name?.toLowerCase().includes(nameFilter) ||
            user.twitch_name?.toLowerCase().includes(nameFilter)
          ) &&
          (!roleFilter || user.permissions.includes(roleFilter))
        }
      />
    </div>
  );
};

export default UserPage;
