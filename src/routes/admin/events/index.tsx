import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Event, Permission, GameVersion, EventCreate } from "@client/api";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/16/solid";
import { renderConditionally } from "@utils/token";
import { useAppForm } from "@components/form/context";
import { ColumnDef } from "@tanstack/react-table";
import Table from "@components/table";
import {
  useCreateEvent,
  useDeleteEvent,
  useDuplicateEvent,
  useGetEvents,
} from "@client/query";
import { Dialog } from "@components/dialog";
import { useState } from "react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { DeleteButton } from "@components/delete-button";
import { objectiveApi } from "@client/client";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/admin/events/")({
  component: renderConditionally(EventPage, [
    Permission.admin,
    Permission.objective_designer,
  ]),
});

function EventPage() {
  const { events, isPending, isError } = useGetEvents();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { duplicateEvent } = useDuplicateEvent(queryClient);
  const { createEvent } = useCreateEvent(queryClient, () => setIsOpen(false));
  const { deleteEvent } = useDeleteEvent(queryClient);

  const form = useAppForm({
    defaultValues: selectedEvent
      ? selectedEvent
      : ({
          name: "",
          game_version: GameVersion.poe1,
          application_start_time: new Date().toISOString(),
          application_end_time: new Date().toISOString(),
          event_start_time: new Date().toISOString(),
          event_end_time: new Date().toISOString(),
          max_size: 0,
          waitlist_size: 0,
          is_current: false,
          is_public: false,
          is_locked: false,
        } as EventCreate),
    onSubmit: (data) => createEvent(data.value),
  });

  const ColumnDef: ColumnDef<Event>[] = [
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
      size: 100,
    },
    {
      header: "Dates",
      size: 300,
      cell: (info) => (
        <div className="grid grid-cols-2 gap-2">
          <div>Application Start: </div>
          <div>
            {new Date(
              info.row.original.application_start_time
            ).toLocaleString()}
          </div>
          <div>Application End: </div>
          <div>
            {new Date(info.row.original.application_end_time).toLocaleString()}
          </div>
          <div>Event Start: </div>
          <div>
            {new Date(info.row.original.event_start_time).toLocaleString()}
          </div>
          <div>Event End: </div>
          <div>
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
          <CheckCircleIcon className="h-6 w-6 text-success" />
        ) : (
          <XCircleIcon className="h-6 w-6 text-error" />
        ),
      enableSorting: false,
      size: 80,
    },
    {
      header: "Public",
      accessorKey: "is_public",
      cell: (info) =>
        info.row.original.is_public ? (
          <CheckCircleIcon className="h-6 w-6 text-success" />
        ) : (
          <XCircleIcon className="h-6 w-6 text-error" />
        ),
      enableSorting: false,
      size: 80,
    },
    {
      header: "Locked",
      accessorKey: "is_locked",
      cell: (info) =>
        info.row.original.is_locked ? (
          <CheckCircleIcon className="h-6 w-6 text-success" />
        ) : (
          <XCircleIcon className="h-6 w-6 text-error" />
        ),
      enableSorting: false,
      size: 80,
    },
    {
      header: "Actions",
      size: 400,
      cell: (info) => (
        <div className="flex flex-row gap-2 flex-wrap">
          <button
            className="btn btn-warning btn-sm"
            onClick={() => {
              setSelectedEvent(info.row.original);
              form.reset();
              setIsOpen(true);
            }}
          >
            <PencilSquareIcon className="h-6 w-6" />
          </button>
          <DeleteButton
            onDelete={() => deleteEvent(info.row.original.id)}
            requireConfirmation
            className="btn-sm"
          />
          <button
            className="btn btn-sm"
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
            className="btn btn-sm"
          >
            Teams
          </Link>
          <Link
            to="/admin/events/$eventId/scoring-presets"
            params={{ eventId: info.row.original.id }}
            className="btn btn-sm"
          >
            Scoring Presets
          </Link>
          <button
            onClick={() => {
              objectiveApi
                .getObjectiveTreeForEvent(info.row.original.id)
                .then((baseObjective) => {
                  navigate({
                    to: "/admin/events/$eventId/categories/$categoryId",
                    params: {
                      eventId: info.row.original.id,
                      categoryId: baseObjective.id,
                    },
                  });
                });
            }}
            className="btn btn-sm"
          >
            Categories
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
        title={selectedEvent ? "Update Event" : "Create Event"}
        className="max-w-xl"
      >
        <form
          className="fieldset bg-base-300 p-6 rounded-box"
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
          <div className="flex flex-row justify-end gap-4 mt-4">
            <button
              type="button"
              className="btn btn-error"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-success">
              {selectedEvent ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Dialog>

      <Table columns={ColumnDef} data={events ?? []} />
      <button
        className="btn btn-success self-center"
        onClick={() => setIsOpen(true)}
      >
        Create new Event
      </button>
    </div>
  );
}

export default EventPage;
