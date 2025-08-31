import { createFileRoute } from "@tanstack/react-router";

import React, { useEffect } from "react";
import { Permission, User } from "@client/api";
import { userApi } from "@client/client";
import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";
import { ColumnDef, sortingFns } from "@tanstack/react-table";
import Table from "@components/table";
import { renderConditionally } from "@utils/token";
import Select from "@components/select";

export const Route = createFileRoute("/admin/user-management")({
  component: renderConditionally(UserPage, [Permission.admin]),
});

function copyDiscordId(value: string | undefined) {
  if (!value) {
    return;
  }
  navigator.clipboard.writeText("<@" + value + ">");
}

function UserPage() {
  const [nameFilter, setNameFilter] = React.useState<string>("");
  const [roleFilter, setRoleFilter] = React.useState<Permission | "">("");
  const [users, setUsers] = React.useState<User[]>([]);
  useEffect(() => {
    userApi.getAllUsers().then((users) => setUsers(users));
  }, []);
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "id",
      header: "ID",
      sortingFn: sortingFns.basic,
      size: 100,
    },
    {
      accessorKey: "display_name",
      header: "Name",
      sortingFn: sortingFns.text,
      size: 200,
    },
    {
      accessorKey: "account_name",
      header: "PoE Name",
      sortingFn: sortingFns.text,
      size: 200,
    },
    {
      accessorKey: "discord_name",
      header: "Discord Name",
      sortingFn: sortingFns.text,
      size: 200,
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
      size: 200,
    },
    {
      accessorKey: "permissions",
      header: "Permissions",
      sortingFn: (a, b) =>
        a.original.permissions.length - b.original.permissions.length,
      cell: (info) => (
        <div className="flex gap-1">
          {Object.values(Permission).map((permission) => (
            <button
              key={permission}
              className={
                "btn btn-xs" +
                (info.row.original.permissions.includes(permission)
                  ? " btn-success"
                  : " btn-error")
              }
              onClick={() => {
                const newPermissions = info.row.original.permissions.slice();
                if (newPermissions.includes(permission)) {
                  newPermissions.splice(newPermissions.indexOf(permission), 1);
                } else {
                  newPermissions.push(permission);
                }
                userApi
                  .changePermissions(info.row.original.id, newPermissions)
                  .then(() => {
                    setUsers((prev) =>
                      prev.map((user) =>
                        user.id === info.row.original.id
                          ? { ...user, permissions: newPermissions }
                          : user
                      )
                    );
                  });
              }}
            >
              {permission}
            </button>
          ))}{" "}
        </div>
      ),

      size: 200,
    },
  ];

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
        <Select
          placeholder="Filter by role"
          value={roleFilter}
          onChange={(value) => setRoleFilter(value as Permission)}
          options={Object.values(Permission)}
        ></Select>
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
        className="h-[70vh]"
      />
    </div>
  );
}

export default UserPage;
