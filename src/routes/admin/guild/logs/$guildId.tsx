import { Action, GuildStashChangelog } from "@client/api";
import { useGetGuildLogs } from "@client/query";
import Table from "@components/table";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { GlobalStateContext } from "@utils/context-provider";
import { useContext, useMemo } from "react";

export const Route = createFileRoute("/admin/guild/logs/$guildId")({
  component: RouteComponent,
  params: {
    parse: (params) => ({
      guildId: Number(params.guildId),
    }),
    stringify: (params) => ({
      guildId: params.guildId.toString(),
    }),
  },
});

function filterMovements(
  logs: GuildStashChangelog[],
  maxMinutesDiff = 10
): GuildStashChangelog[] {
  const start = performance.now();

  // Group logs by account + item + number
  const groups = new Map<string, GuildStashChangelog[]>();

  for (const log of logs) {
    const key = `${log.account_name}:${log.item_name}:${log.number}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(log);
  }

  const toRemove = new Set<GuildStashChangelog>();

  // Process each group
  for (const groupLogs of groups.values()) {
    if (groupLogs.length < 2) continue;

    // Sort by timestamp for easier pairing
    groupLogs.sort((a, b) => a.timestamp - b.timestamp);

    // Find add/remove pairs within time window
    for (let i = 0; i < groupLogs.length - 1; i++) {
      if (toRemove.has(groupLogs[i])) continue;

      const current = groupLogs[i];

      for (let j = i + 1; j < groupLogs.length; j++) {
        if (toRemove.has(groupLogs[j])) continue;

        const other = groupLogs[j];

        // Check time difference first (quick exit)
        const timeDiff = Math.abs(current.timestamp - other.timestamp) / 60;
        if (timeDiff > maxMinutesDiff) break; // logs are sorted, no need to check further

        // Check if actions are opposite
        const isOppositeAction =
          (current.action === Action.added &&
            other.action === Action.removed) ||
          (current.action === Action.removed && other.action === Action.added);

        if (isOppositeAction) {
          toRemove.add(current);
          toRemove.add(other);
          break;
        }
      }
    }
  }

  const result = logs.filter((log) => !toRemove.has(log));

  const end = performance.now();
  console.log(
    `Filtered ${logs.length - result.length} movements in ${end - start}ms`
  );

  return result;
}

function RouteComponent() {
  const { currentEvent } = useContext(GlobalStateContext);
  const { guildId } = useParams({ from: Route.id });

  const { logs = [] } = useGetGuildLogs(currentEvent.id, guildId);
  const filteredLogs = useMemo(() => filterMovements(logs), [logs]);
  const stashNames = Array.from(
    new Set(filteredLogs.map((log) => log.stash_name))
  ).filter((s) => s);
  const columns: ColumnDef<GuildStashChangelog>[] = [
    {
      header: "Timestamp",
      accessorKey: "timestamp",
      cell: ({ row }) =>
        new Date(row.original.timestamp * 1000).toLocaleString(),
      size: 200,
    },
    {
      header: "",
      accessorKey: "stash_name",
      size: 200,
      enableSorting: false,
      filterFn: "includesString",
      meta: {
        filterVariant: "enum",
        filterPlaceholder: "Stash",
        options: stashNames,
      },
    },
    {
      header: "",
      accessorKey: "account_name",
      size: 250,
      enableSorting: false,
      filterFn: "includesString",
      meta: {
        filterVariant: "string",
        filterPlaceholder: "Account",
      },
    },
    {
      header: "Action",
      accessorKey: "action",
      size: 100,
      enableSorting: false,
    },
    {
      header: "Number",
      accessorKey: "number",
      size: 100,
      enableSorting: false,
    },
    {
      header: "",
      accessorKey: "item_name",
      size: 400,
      enableSorting: false,
      filterFn: "includesString",
      meta: {
        filterVariant: "string",
        filterPlaceholder: "Item",
      },
    },
  ];

  return (
    <Table
      className="w-full h-[80vh]"
      data={filteredLogs}
      columns={columns}
      rowClassName={(row) => {
        switch (row.original.action) {
          case Action.added:
            return "bg-success/20";
          case Action.removed:
            return "bg-error/20";
          default:
            return "";
        }
      }}
    />
  );
}
