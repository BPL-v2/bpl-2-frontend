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

interface ProcessedLog extends Omit<GuildStashChangelog, "number"> {
  number: number;
  originalNumber?: number; // Store original number for modified actions
  displayNumber: string; // What to display in the UI
}

function filterMovementsAndProcessQuantities(
  logs: GuildStashChangelog[],
  maxMinutesDiff = 10
): ProcessedLog[] {
  const start = performance.now();

  // Sort all logs by timestamp first
  const sortedLogs = [...logs].sort((a, b) => a.timestamp - b.timestamp);

  // Step 1: First pass - identify movements to filter out
  const movementGroups = new Map<string, GuildStashChangelog[]>();
  for (const log of sortedLogs) {
    const key = `${log.account_name}:${log.item_name}`;
    if (!movementGroups.has(key)) {
      movementGroups.set(key, []);
    }
    movementGroups.get(key)!.push(log);
  }

  const toRemove = new Set<GuildStashChangelog>();

  // Find movements within time window
  for (const groupLogs of movementGroups.values()) {
    for (let i = 0; i < groupLogs.length - 1; i++) {
      if (toRemove.has(groupLogs[i])) continue;

      const current = groupLogs[i];
      for (let j = i + 1; j < groupLogs.length; j++) {
        if (toRemove.has(groupLogs[j])) continue;

        const other = groupLogs[j];

        // Check time difference first
        const timeDiff = Math.abs(current.timestamp - other.timestamp) / 60;
        if (timeDiff > maxMinutesDiff) break;

        // Check if actions are opposite and same quantity
        const isOppositeAction =
          (current.action === Action.added &&
            other.action === Action.removed) ||
          (current.action === Action.removed && other.action === Action.added);

        if (isOppositeAction && current.number === other.number) {
          toRemove.add(current);
          toRemove.add(other);
          break;
        }
      }
    }
  }

  // Step 2: Second pass - process quantities with movements filtered out
  const processedLogs: ProcessedLog[] = [];

  // Group by stash_name + item_name for quantity tracking
  const quantityGroups = new Map<string, GuildStashChangelog[]>();
  for (const log of sortedLogs) {
    const key = `${log.stash_name}:${log.item_name}`;
    if (!quantityGroups.has(key)) {
      quantityGroups.set(key, []);
    }
    quantityGroups.get(key)!.push(log);
  }

  for (const groupLogs of quantityGroups.values()) {
    let currentQuantity = 0;

    for (const log of groupLogs) {
      if (toRemove.has(log)) continue;

      let processedLog: ProcessedLog = {
        ...log,
        displayNumber: log.number.toString(),
        originalNumber: log.number,
      };

      if (log.action === Action.added) {
        currentQuantity += log.number;
      } else if (log.action === Action.removed) {
        currentQuantity -= log.number;
      } else if (log.action === Action.modified) {
        // Calculate the difference from current tracked quantity
        const previousQuantity = currentQuantity;
        currentQuantity = log.number;
        const difference = currentQuantity - previousQuantity;

        processedLog.displayNumber = `${currentQuantity} (${difference > 0 ? `+${difference}` : difference})`;
      }

      processedLogs.push(processedLog);
    }
  }

  // Sort processed logs back to original timestamp order
  processedLogs.sort((a, b) => a.timestamp - b.timestamp);

  const end = performance.now();
  console.log(
    `Filtered ${logs.length - processedLogs.length} movements and processed quantities in ${end - start}ms`
  );

  return processedLogs;
}

function RouteComponent() {
  const { currentEvent } = useContext(GlobalStateContext);
  const { guildId } = useParams({ from: Route.id });

  const { logs = [] } = useGetGuildLogs(currentEvent.id, guildId);
  const processedLogs = useMemo(
    () => filterMovementsAndProcessQuantities(logs),
    [logs]
  );

  const stashNames = Array.from(
    new Set(processedLogs.map((log) => log.stash_name))
  ).filter((s) => s);

  const columns: ColumnDef<ProcessedLog>[] = [
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
      accessorKey: "displayNumber",
      size: 100,
      enableSorting: false,
      cell: ({ row }) => (
        <span
          className={
            row.original.action === Action.modified
              ? row.original.displayNumber.includes("+")
                ? "text-success"
                : "text-error"
              : ""
          }
        >
          {row.original.displayNumber}
        </span>
      ),
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
    <div className="flex flex-col gap-4">
      <Table
        className="w-full h-[80vh]"
        data={processedLogs.sort((a, b) => b.timestamp - a.timestamp)}
        columns={columns}
        rowClassName={(row) => {
          switch (row.original.action) {
            case Action.added:
              return "bg-success/20";
            case Action.removed:
              return "bg-error/20";
            case Action.modified:
              return "bg-warning/20";
            default:
              return "";
          }
        }}
      />
    </div>
  );
}
