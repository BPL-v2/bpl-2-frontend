import { Event, EventCreate, GameVersion, Permission } from "@client/api";
import { objectiveApi } from "@client/client";
import {
  useCreateEvent,
  useDeleteEvent,
  useDuplicateEvent,
  useGetEvents,
} from "@client/query";
import { DeleteButton } from "@components/form/delete-button";
import { Dialog } from "@components/dialog";
import { setFormValues, useAppForm } from "@components/form/context";
import Table from "@components/table/table";
import {
  CheckCircleIcon,
  PencilSquareIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { renderConditionally } from "@utils/token";
import { useState } from "react";

export const Route = createFileRoute("/admin/events/")({
  component: renderConditionally(EventPage, [
    Permission.admin,
    Permission.objective_designer,
  ]),
});

function EventPage() {
  const { events, isPending, isError } = useGetEvents();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { duplicateEvent } = useDuplicateEvent(queryClient);
  const { createEvent } = useCreateEvent(queryClient, () => setIsOpen(false));
  const { deleteEvent } = useDeleteEvent(queryClient);

  const form = useAppForm({
    defaultValues: {
      name: "",
      patch: "",
      game_version: GameVersion.poe1,
      application_start_time: new Date().toISOString(),
      application_end_time: new Date().toISOString(),
      event_start_time: new Date().toISOString(),
      event_end_time: new Date().toISOString(),
      max_size: 1000,
      waitlist_size: 100,
      is_current: false,
      is_public: false,
      is_locked: false,
    } as EventCreate,
    onSubmit: (data) => createEvent(data.value),
  });

  const columnDef: ColumnDef<Event>[] = [
    {
      header: "ID",
      accessorKey: "id",
      size: 20,
      enableSorting: false,
    },
    {
      header: "Name",
      accessorKey: "name",
      enableSorting: false,
    },
    {
      header: "Version",
      accessorKey: "game_version",
      enableSorting: false,
      size: 80,
    },
    {
      header: "Dates",
      size: 340,
      cell: (info) => (
        <div className="grid w-full grid-cols-2 gap-0 text-xs">
          <div className="text-left">Application Start: </div>
          <div className="text-right font-mono">
            {new Date(
              info.row.original.application_start_time,
            ).toLocaleString()}
          </div>
          <div className="text-left">Application End: </div>
          <div className="text-right font-mono">
            {new Date(info.row.original.application_end_time).toLocaleString()}
          </div>
          <div className="text-left">Event Start: </div>
          <div className="text-right font-mono">
            {new Date(info.row.original.event_start_time).toLocaleString()}
          </div>
          <div className="text-left">Event End: </div>
          <div className="text-right font-mono">
            {new Date(info.row.original.event_end_time).toLocaleString()}
          </div>
        </div>
      ),
      enableSorting: false,
    },
    {
      header: "Size",
      accessorKey: "max_size",
      enableSorting: false,
      size: 80,
    },
    {
      header: "Waitlist",
      accessorKey: "waitlist_size",
      enableSorting: false,
      size: 80,
    },
    {
      header: "Current",
      accessorKey: "is_current",
      cell: (info) =>
        info.row.original.is_current ? (
          <CheckCircleIcon className="size-6 text-success" />
        ) : (
          <XCircleIcon className="size-6 text-error" />
        ),
      enableSorting: false,
      size: 80,
    },
    {
      header: "Public",
      accessorKey: "is_public",
      cell: (info) =>
        info.row.original.is_public ? (
          <CheckCircleIcon className="size-6 text-success" />
        ) : (
          <XCircleIcon className="size-6 text-error" />
        ),
      enableSorting: false,
      size: 70,
    },
    {
      header: "Locked",
      accessorKey: "is_locked",
      cell: (info) =>
        info.row.original.is_locked ? (
          <CheckCircleIcon className="size-6 text-success" />
        ) : (
          <XCircleIcon className="size-6 text-error" />
        ),
      enableSorting: false,
      size: 70,
    },
    {
      header: "Actions",
      size: 450,
      cell: (info) => (
        <div className="flex flex-row flex-wrap gap-1">
          <button
            className="btn btn-xs btn-warning"
            onClick={() => {
              setFormValues(form, info.row.original);
              setIsOpen(true);
            }}
          >
            <PencilSquareIcon className="size-6" />
          </button>
          <DeleteButton
            onDelete={() => deleteEvent(info.row.original.id)}
            requireConfirmation
            className="btn-xs"
          />
          <button
            className="btn btn-xs"
            onClick={() =>
              duplicateEvent({
                eventId: info.row.original.id,
                eventCreate: {
                  ...info.row.original,
                  id: undefined,
                  name: `${info.row.original.name} (Copy)`,
                  is_current: false,
                  is_public: false,
                  is_locked: false,
                },
              })
            }
          >
            Duplicate
          </button>
          <Link
            to="/admin/events/$eventId/teams"
            params={{ eventId: info.row.original.id }}
            className="btn btn-xs"
          >
            Teams
          </Link>
          <Link
            to="/admin/events/$eventId/scoring-presets"
            params={{ eventId: info.row.original.id }}
            className="btn btn-xs"
          >
            Scoring Presets
          </Link>
          <button
            onClick={() => {
              objectiveApi
                .getObjectiveTreeForEvent(info.row.original.id)
                .then((baseObjective) => {
                  navigate({
                    to: "/admin/events/$eventId/objectives/$objectiveId",
                    params: {
                      eventId: info.row.original.id,
                      objectiveId: baseObjective.id,
                    },
                  });
                });
            }}
            className="btn btn-xs"
          >
            Objectives
          </button>
        </div>
      ),
      enableSorting: false,
    },
  ];

  if (isPending) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error</div>;
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      <Dialog
        setOpen={setIsOpen}
        open={isOpen}
        title={"Create Event"}
        className="max-w-xl"
      >
        <form
          className="fieldset rounded-box bg-base-300 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="flex flex-row gap-4">
            <form.AppField
              name="name"
              children={(field) => <field.TextField label="Name" />}
            />
            <form.AppField
              name="game_version"
              children={(field) => (
                <field.SelectField
                  label="Game Version"
                  options={Object.values(GameVersion)}
                />
              )}
            />
            <form.AppField
              name="patch"
              children={(field) => <field.TextField label="Patch" />}
            />
          </div>
          <div className="flex flex-row gap-4">
            <form.AppField
              name="application_start_time"
              children={(field) => (
                <field.DateTimeField label="Application Start Time" />
              )}
            />
            <form.AppField
              name="application_end_time"
              children={(field) => (
                <field.DateTimeField label="Application End Time" />
              )}
            />
          </div>
          <div className="flex flex-row gap-4">
            <form.AppField
              name="event_start_time"
              children={(field) => (
                <field.DateTimeField label="Event Start Time" />
              )}
            />
            <form.AppField
              name="event_end_time"
              children={(field) => (
                <field.DateTimeField label="Event End Time" />
              )}
            />
          </div>
          <div className="flex flex-row gap-4">
            <form.AppField
              name="max_size"
              children={(field) => <field.NumberField label="Max Size" />}
            />
            <form.AppField
              name="waitlist_size"
              children={(field) => <field.NumberField label="Waitlist Size" />}
            />
          </div>
          <div className="flex flex-row justify-between">
            <form.AppField
              name="is_current"
              children={(field) => <field.BooleanField label="Is Current" />}
            />
            <form.AppField
              name="is_public"
              children={(field) => <field.BooleanField label="Is Public" />}
            />
            <form.AppField
              name="is_locked"
              children={(field) => <field.BooleanField label="Is Locked" />}
            />
          </div>
          <div className="mt-4 flex flex-row justify-end gap-4">
            <button
              type="button"
              className="btn btn-error"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-success">
              Save
            </button>
          </div>
        </form>
      </Dialog>

      <Table
        columns={columnDef}
        data={events?.sort((a, b) => b.id - a.id) ?? []}
      />
      <button
        className="btn self-center btn-success"
        onClick={() => setIsOpen(true)}
      >
        Create new Event
      </button>
    </div>
  );
}

export default EventPage;
