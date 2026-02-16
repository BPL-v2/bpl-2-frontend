import { SortedUser } from "@client/api";
import { useGetSortedPlayers } from "@client/query";
import Table from "@components/table/table";
import {
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { createFileRoute } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { GlobalStateContext } from "@utils/context-provider";
import { isLoggedIn } from "@utils/token";
import { useContext } from "react";
import { router } from "../main";

export const Route = createFileRoute("/players")({
  component: RouteComponent,
});
function copyDiscordId(value: string | undefined) {
  if (!value) {
    return;
  }
  navigator.clipboard.writeText("<@" + value + ">");
}

function RouteComponent() {
  const { currentEvent } = useContext(GlobalStateContext);
  const { sortedPlayers } = useGetSortedPlayers(currentEvent.id);
  if (!isLoggedIn()) {
    router.navigate({ to: "/", replace: true });
  }
  const teamMap = currentEvent.teams.reduce(
    (acc, team) => {
      acc[team.id] = team.name;
      return acc;
    },
    {} as Record<number, string>,
  );
  const columnDef: ColumnDef<SortedUser>[] = [
    {
      header: "",
      accessorKey: "team_id",
      accessorFn: (row) => teamMap[row.team_id],
      size: 200,
      filterFn: "includesString",
      enableSorting: false,
      meta: {
        filterVariant: "enum",
        filterPlaceholder: "Team",
        options: currentEvent.teams.map((team) => team.name),
      },
    },
    {
      header: "",
      accessorKey: "poe_name",
      size: 300,
      filterFn: "includesString",
      enableSorting: false,
      meta: {
        filterVariant: "string",
        filterPlaceholder: "PoE Name",
      },
    },
    {
      header: "",
      accessorKey: "discord_name",
      size: 300,
      filterFn: "includesString",
      enableSorting: false,
      meta: {
        filterVariant: "string",
        filterPlaceholder: "Discord Name",
      },
    },
    {
      header: "Discord ID",
      accessorKey: "discord_id",
      size: 250,
      enableSorting: false,
      cell: (info) => (
        <a
          onClick={() => copyDiscordId(info.row.original.discord_id)}
          className="flex gap-2"
        >
          <ClipboardDocumentCheckIcon className="size-6 cursor-pointer transition-transform duration-100 select-none hover:text-primary active:scale-110 active:text-secondary" />
          {info.row.original.discord_id}
        </a>
      ),
    },
    {
      header: "Leader",
      accessorKey: "is_team_lead",
      size: 120,
      filterFn: "equals",
      enableSorting: false,
      meta: {
        filterVariant: "boolean",
        filterPlaceholder: "Team Lead",
      },
      cell: (info) =>
        info.getValue() ? (
          <CheckCircleIcon className="size-6 text-success" />
        ) : (
          <XCircleIcon className="size-6 text-error" />
        ),
    },
  ];
  return (
    <div className="mt-4 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Sorted Players</h1>
      <Table
        columns={columnDef}
        data={sortedPlayers || []}
        className="max-h-[70vh]"
      />
    </div>
  );
}
