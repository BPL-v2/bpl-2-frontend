import React, { useContext, useEffect } from "react";
import { GlobalStateContext } from "../../utils/context-provider";
import { Permission, User } from "../../client";
import { userApi } from "../../client/client";
import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";
import { ColumnDef, sortingFns } from "@tanstack/react-table";
import { Table } from "../../components/table";

const columns: ColumnDef<User, any>[] = [
  {
    accessorKey: "id",
    header: "ID",
    sortingFn: sortingFns.basic,
  },
  {
    accessorKey: "display_name",
    header: "Name",
    sortingFn: sortingFns.text,
  },
  {
    accessorKey: "account_name",
    header: "PoE Name",
    sortingFn: sortingFns.text,
  },
  {
    accessorKey: "discord_name",
    header: "Discord Name",
    sortingFn: sortingFns.text,
  },
  {
    accessorKey: "discord_id",
    header: "Discord ID",
    sortingFn: sortingFns.basic,
    cell: (info) => (
      <a
        onClick={() => copyDiscordId(info.row.original.discord_id)}
        className="flex gap-2"
      >
        <ClipboardDocumentCheckIcon className="cursor-pointer h-6 w-6" />
        {info.row.original.discord_id}
      </a>
    ),
  },
  {
    accessorKey: "permissions",
    header: "Permissions",
    sortingFn: (a, b) =>
      a.original.permissions.length - b.original.permissions.length,
    cell: (info) => info.row.original.permissions.join(", "),
    size: 200,
  },
];

function copyDiscordId(value: string | undefined) {
  if (!value) {
    return;
  }
  navigator.clipboard.writeText("<@" + value + ">");
}

const UserPage: React.FC = () => {
  const { user } = useContext(GlobalStateContext);
  const [nameFilter, setNameFilter] = React.useState<string>("");
  const [roleFilter, setRoleFilter] = React.useState<Permission | "">("");
  const [users, setUsers] = React.useState<User[]>([]);
  useEffect(() => {
    userApi.getAllUsers().then((users) => setUsers(users));
  }, []);

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
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as Permission)}
          >
            <option value="">All</option>
            {Object.values(Permission).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Table<User>
        data={users.filter(
          (user) =>
            !!(
              user.display_name?.toLowerCase().includes(nameFilter) ||
              user.account_name?.toLowerCase().includes(nameFilter) ||
              user.discord_name?.toLowerCase().includes(nameFilter) ||
              user.twitch_name?.toLowerCase().includes(nameFilter)
            ) &&
            (!roleFilter || user.permissions.includes(roleFilter))
        )}
        columns={columns}
        pageSizeOptions={[20, 50, 100]}
      />
    </div>
  );
};

export default UserPage;
