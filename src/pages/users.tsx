import React, { useContext } from "react";
import CrudTable, { CrudColumn } from "../components/crudtable";
import { User, UserPermission } from "../types/user";
import { editUserPermissions, getAllUsers } from "../client/user-client";
import { CopyOutlined } from "@ant-design/icons";
import { GlobalStateContext } from "../utils/context-provider";

const columns: CrudColumn<User>[] = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    type: "number",
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
        <a onClick={() => copyDiscordId(value)}>
          <CopyOutlined />
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
    render: (value: UserPermission[]) => {
      return value.join(", ");
    },
    options: Object.values(UserPermission),
    editable: true,
  },
];

function copyDiscordId(value: number) {
  navigator.clipboard.writeText("<@" + value.toString() + ">");
}

const UserPage: React.FC = () => {
  const { user } = useContext(GlobalStateContext);
  if (!user || !user.permissions.includes(UserPermission.ADMIN)) {
    return <div>You do not have permission to view this page</div>;
  }
  return (
    <CrudTable<User>
      resourceName="User"
      columns={columns}
      fetchFunction={getAllUsers}
      editFunction={editUserPermissions}
    />
  );
};

export default UserPage;
