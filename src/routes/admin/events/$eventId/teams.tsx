import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { GameVersion, Permission, Team, TeamCreate } from "@client/api";
import { renderConditionally } from "@utils/token";
import { useCreateTeam, useDeleteTeam, useGetEvents } from "@client/query";
import { ColumnDef } from "@tanstack/react-table";
import Table from "@components/table";
import { useAppForm } from "@components/form/context";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog } from "@components/dialog";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

export const Route = createFileRoute("/admin/events/$eventId/teams")({
  component: renderConditionally(TeamPage, [
    Permission.admin,
    Permission.objective_designer,
  ]),

  params: {
    parse: (params) => ({
      eventId: Number(params.eventId),
    }),
    stringify: (params) => ({
      eventId: params.eventId.toString(),
    }),
  },
});

function TeamPage() {
  const { eventId } = useParams({ from: Route.id });
  const { events, isPending, isError } = useGetEvents();
  const event = events?.find((event) => event.id === eventId);
  const [team, setTeam] = useState<Team>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const qc = useQueryClient();
  const { createTeam } = useCreateTeam(qc, eventId, () => {
    setIsDialogOpen(false);
  });
  const { deleteTeam } = useDeleteTeam(qc, eventId);

  const teamForm = useAppForm({
    defaultValues: team
      ? team
      : ({
          name: "",
          color: "#bbb",
          allowed_classes: [],
        } as TeamCreate),
    onSubmit: (data) => createTeam(data.value),
  });

  const columns: ColumnDef<Team>[] = [
    {
      header: "ID",
      accessorKey: "id",
    },
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Color",
      accessorKey: "color",
      cell: (info) => (
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: info.row.original.color }}
        ></div>
      ),
    },
    {
      header: "Allowed Classes",
      accessorKey: "allowed_classes",
      cell: (info) => info.row.original.allowed_classes.join(", "),
      size: 300,
    },
    {
      header: "Actions",
      cell: (info) => (
        <div className="flex flex-row gap-2">
          <button
            className="btn btn-sm btn-error"
            onClick={() => deleteTeam(info.row.original.id)}
          >
            <TrashIcon className="w-4 h-4" />
          </button>
          <button
            className="btn btn-sm btn-warning"
            onClick={() => {
              setTeam(info.row.original);
              setIsDialogOpen(true);
            }}
          >
            <PencilSquareIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const dialog = useMemo(() => {
    return (
      <Dialog
        title={team ? "Edit Team" : "Create Team"}
        open={isDialogOpen}
        setOpen={setIsDialogOpen}
        className="w-md "
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            teamForm.handleSubmit();
          }}
          className="flex flex-col gap-2 bg-base-300 p-4 rounded-box w-full"
        >
          <teamForm.AppField
            name="name"
            children={(field) => <field.TextField label="Name" required />}
          />
          <teamForm.AppField
            name="color"
            children={(field) => <field.ColorField label="Color" />}
          />
          <teamForm.AppField
            name="allowed_classes"
            children={(field) => (
              <field.ArrayField
                className="h-80"
                label="Allowed Classes"
                options={
                  event?.game_version === GameVersion.poe2
                    ? [
                        "Warbringer",
                        "Titan",
                        "Chronomancer",
                        "Stormweaver",
                        "Witchhunter",
                        "Gemling Legionnaire",
                        "Invoker",
                        "Acolyte of Chayula",
                        "Deadeye",
                        "Pathfinder",
                        "Blood Mage",
                        "Infernalist",
                      ]
                    : [
                        "Ascendant",
                        "Assassin",
                        "Berserker",
                        "Champion",
                        "Chieftain",
                        "Deadeye",
                        "Elementalist",
                        "Gladiator",
                        "Guardian",
                        "Hierophant",
                        "Inquisitor",
                        "Juggernaut",
                        "Necromancer",
                        "Occultist",
                        "Pathfinder",
                        "Saboteur",
                        "Slayer",
                        "Trickster",
                        "Warden",
                      ]
                }
              />
            )}
          />
          <div className="flex flex-row gap-2 justify-end mt-2">
            <button
              className="btn btn-error"
              type="button"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </button>
            <button className="btn btn-primary" type="submit">
              {team ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </Dialog>
    );
  }, [team, teamForm, isDialogOpen, event?.game_version]);

  if (isPending) {
    return <div className="loading loading-spinner loading-lg"></div>;
  }
  if (isError) {
    return <div>Error loading events.</div>;
  }
  if (!event || !eventId) {
    return <></>;
  }

  return (
    <div className="flex flex-col gap-2">
      <Table columns={columns} data={event.teams} />
      <button
        className="btn btn-primary self-center"
        onClick={() => {
          teamForm.reset();
          setIsDialogOpen(true);
          setTeam(undefined);
        }}
      >
        Create Team
      </button>
      {dialog}
    </div>
  );
}

export default TeamPage;
