import {
  useGetGuildStash,
  useSwitchStashFetching,
  useUpdateGuildStash,
} from "@client/query";
import Table from "@components/table";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { GlobalStateContext } from "@utils/context-provider";
import { useContext, useMemo } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { GuildStashTab } from "@client/api";
import { ColumnDef } from "@tanstack/react-table";

export const Route = createFileRoute("/admin/guild-stashes/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { currentEvent } = useContext(GlobalStateContext);
  const queryClient = useQueryClient();
  const { data: guildStashes } = useGetGuildStash(currentEvent.id);
  const { mutate: updateGuildStashes } = useUpdateGuildStash(
    queryClient,
    currentEvent.id
  );
  const { mutate: switchGuildStash } = useSwitchStashFetching(
    queryClient,
    currentEvent.id
  );
  dayjs.extend(relativeTime);

  const columns: ColumnDef<GuildStashTab>[] = useMemo(
    () => [
      {
        header: "Idx",
        accessorKey: "index",
      },
      {
        header: "Name",
        accessorKey: "name",
        cell: (info) => (
          <div
            className="p-2 rounded-box border-2 w-full"
            style={{ borderColor: "#" + info.row.original.color }}
          >
            {info.row.original.name}
          </div>
        ),
      },
      {
        header: "Type",
        accessorKey: "type",
        cell: (info) => info.row.original.type?.replace("Stash", ""),
      },
      {
        header: "Last Updated",
        accessorKey: "last_fetch",
        cell: (info) => (
          <div
            className="tooltip tooltip-info tooltip-bottom"
            data-tip={new Date(info.row.original.last_fetch).toLocaleString()}
          >
            {dayjs(info.row.original.last_fetch).fromNow()}
          </div>
        ),
      },
      {
        header: "Enabled",
        accessorKey: "fetch_enabled",
        cell: (info) => (
          <div className="flex justify-center w-full">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={info.row.original.fetch_enabled}
              onChange={() => {
                switchGuildStash(info.row.original.id);
              }}
            ></input>
          </div>
        ),
      },
      {
        header: "Items",
        id: "actions",
        cell: (info) => (
          <div className="flex justify-center w-full">
            <Link
              to={`/admin/guild-stashes/$stashId`}
              className="btn btn-primary btn-sm"
              params={{ stashId: info.row.original.id }}
              search={{
                type: info.row.original.type,
              }}
            >
              View
            </Link>
          </div>
        ),
      },
    ],
    []
  );
  const parents =
    guildStashes
      ?.map((stash) => {
        if (stash.parent_id) {
          return stash.parent_id;
        }
        if (stash.type === "Folder") {
          return stash.id;
        }
        return null;
      })
      .filter((id) => id !== null) || [];
  return (
    <div className="flex flex-col gap-4 p-4 items-center">
      <button
        className="btn btn-primary "
        onClick={() => {
          updateGuildStashes(); // Example stash ID
        }}
      >
        Update Guild Stash
      </button>
      {parents.map((parentId) => {
        const children = guildStashes?.filter(
          (stash) => stash.parent_id === parentId
        );
        if (!children || children.length === 0) {
          return null; // Skip rendering if no children
        }
        return (
          <Table
            className="h-[70vh] w-full"
            key={parentId}
            columns={columns}
            data={children}
          ></Table>
        );
      })}
      <Table
        className="h-[70vh] w-full"
        columns={columns}
        data={
          guildStashes?.filter(
            (stash) => !stash.parent_id && !parents.includes(stash.id)
          ) || []
        }
      ></Table>
    </div>
  );
}
