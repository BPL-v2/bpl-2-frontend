import { createFileRoute } from "@tanstack/react-router";
import { useContext } from "react";
import CrudTable, { CrudColumn } from "@components/crudtable";
import { GlobalStateContext } from "@utils/context-provider";
import { EventCreate, Event, Permission } from "@client/api";
import { eventApi, scoringApi } from "@client/client";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/16/solid";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/events/")({
  component: EventPage,
});
const columns: CrudColumn<Event>[] = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    type: "number",
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    type: "text",
    editable: true,
    required: true,
  },
  {
    title: "Version",
    dataIndex: "game_version",
    key: "game_version",
    type: "select",
    editable: true,
    options: ["poe1", "poe2"],
    required: true,
  },
  {
    title: "Dates",
    key: "dates",
    render: (_, event) => (
      <div className="grid grid-cols-2 gap-2">
        <div>Application Start: </div>
        <div>{new Date(event.application_start_time).toLocaleString()}</div>
        <div>Event Start: </div>
        <div>{new Date(event.event_start_time).toLocaleString()}</div>
        <div>Event End: </div>
        <div>{new Date(event.event_end_time).toLocaleString()}</div>
      </div>
    ),
  },
  {
    title: "Application Start",
    dataIndex: "application_start_time",
    key: "application_start_time",
    type: "date",
    editable: true,
    required: true,
    hidden: true,
  },
  {
    title: "Event Start",
    dataIndex: "event_start_time",
    key: "event_start_time",
    type: "date",
    editable: true,
    required: true,
    hidden: true,
  },
  {
    title: "Event End",
    dataIndex: "event_end_time",
    key: "event_end_time",
    type: "date",
    editable: true,
    required: true,
    hidden: true,
  },
  {
    title: "MaxSize",
    dataIndex: "max_size",
    key: "max_size",
    type: "number",
    editable: true,
    required: true,
  },
  {
    title: "Current",
    dataIndex: "is_current",
    key: "is_current",
    type: "checkbox",
    editable: true,
    render: (_, event) =>
      event.is_current ? (
        <CheckCircleIcon className="h-6 w-6 text-success" />
      ) : (
        <XCircleIcon className="h-6 w-6 text-error" />
      ),
  },
  {
    title: "Public",
    dataIndex: "is_public",
    key: "is_public",
    type: "checkbox",
    editable: true,
    render: (_, event) =>
      event.is_public ? (
        <CheckCircleIcon className="h-6 w-6 text-success" />
      ) : (
        <XCircleIcon className="h-6 w-6 text-error" />
      ),
  },
  {
    title: "Locked",
    dataIndex: "is_locked",
    key: "is_locked",
    type: "checkbox",
    editable: true,
    render: (_, event) =>
      event.is_locked ? (
        <CheckCircleIcon className="h-6 w-6 text-success" />
      ) : (
        <XCircleIcon className="h-6 w-6 text-error" />
      ),
  },
];

function EventPage() {
  const { user, events, setEvents } = useContext(GlobalStateContext);
  const navigate = useNavigate();

  if (!user || !user.permissions.includes(Permission.admin)) {
    return <div>You do not have permission to view this page</div>;
  }

  const createEventWrapper = async (data: EventCreate) => {
    return eventApi.createEvent(data).then((res) => {
      setEvents([...events, res]);
      return res;
    });
  };

  const deleteEventWrapper = async (data: Event) => {
    return eventApi.deleteEvent(data.id).then(() => {
      setEvents(events.filter((event) => event.id !== data.id));
    });
  };

  const editEventWrapper = async (data: Event) => {
    return eventApi.createEvent(data).then((newEvent) => {
      setEvents(
        events.map((event) => (event.id === newEvent.id ? newEvent : event))
      );
      return newEvent;
    });
  };

  return (
    <div className="mt-4">
      <CrudTable<Event>
        resourceName="Event"
        columns={columns}
        fetchFunction={eventApi.getEvents}
        createFunction={createEventWrapper}
        editFunction={editEventWrapper}
        deleteFunction={deleteEventWrapper}
        addtionalActions={[
          {
            name: "Duplicate Config",
            func: async (data) =>
              eventApi
                .duplicateEvent(data.id, data)
                .then((res) => setEvents([...events, res])),
            reload: true,
          },
          {
            name: "Teams",
            func: async (data) =>
              navigate({
                to: "/admin/events/$eventId/teams",
                params: { eventId: data.id },
              }),
          },
          {
            name: "Scoring Categories",
            func: async (data) =>
              scoringApi.getRulesForEvent(data.id).then((rules) => {
                navigate({
                  to: "/admin/events/$eventId/categories/$categoryId",
                  params: { eventId: data.id, categoryId: rules.id },
                });
              }),
          },
          {
            name: "Scoring Presets",
            func: async (data) =>
              navigate({
                to: "/admin/events/$eventId/scoring-presets",
                params: { eventId: data.id },
              }),
          },
        ]}
      />
    </div>
  );
}

export default EventPage;
