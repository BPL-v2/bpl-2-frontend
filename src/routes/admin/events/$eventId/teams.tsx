import { GameVersion, Permission, Team, TeamCreate } from "@client/api";
import { useCreateTeam, useDeleteTeam, useGetEvents } from "@client/query";
import { Dialog } from "@components/dialog";
import { useAppForm } from "@components/form/context";
import Table from "@components/table";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { renderConditionally } from "@utils/token";
import { useMemo, useState } from "react";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const qc = useQueryClient();
  const { createTeam } = useCreateTeam(qc, eventId, () => {
    setIsDialogOpen(false);
  });
  const { deleteTeam } = useDeleteTeam(qc, eventId);

  const teamForm = useAppForm({
    defaultValues: {
      name: "",
      color: "#000000",
      allowed_classes: [],
    } as TeamCreate,
    onSubmit: (data) => createTeam(data.value as TeamCreate),
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
              teamForm.reset(info.row.original, { keepDefaultValues: true });
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
        title={"Create Team"}
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
              {"Save"}
            </button>
          </div>
        </form>
      </Dialog>
    );
  }, [teamForm, isDialogOpen, event?.game_version]);

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
      <Table columns={columns} data={event.teams.sort((a, b) => a.id - b.id)} />
      <button
        className="btn btn-primary self-center"
        onClick={() => {
          teamForm.reset();
          setIsDialogOpen(true);
        }}
      >
        Create Team
      </button>
      {dialog}
    </div>
  );
}

export default TeamPage;
