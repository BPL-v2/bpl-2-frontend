import React, { useContext } from "react";
import CrudTable, { CrudColumn } from "../components/crudtable";
import { router } from "../router";
import { GlobalStateContext } from "../utils/context-provider";
import { EventCreate, Event, Permission } from "../client/api";
import { eventApi } from "../client/client";

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
    title: "Current",
    dataIndex: "is_current",
    key: "is_current",
    type: "checkbox",
    editable: true,
    render: (_, event) => (event.is_current ? "Yes" : "No"),
  },
  {
    title: "Game Version",
    dataIndex: "game_version",
    key: "game_version",
    type: "select",
    editable: true,
    options: ["poe1", "poe2"],
    required: true,
  },
  {
    title: "Application Start",
    dataIndex: "application_start_time",
    key: "application_start_time",
    type: "date",
    editable: true,
    required: true,
    render: (date) => new Date(date).toLocaleString(),
  },
  {
    title: "Event Start",
    dataIndex: "event_start_time",
    key: "event_start_time",
    type: "date",
    editable: true,
    required: true,
    render: (date) => new Date(date).toLocaleString(),
  },
  {
    title: "Event End",
    dataIndex: "event_end_time",
    key: "event_end_time",
    type: "date",
    editable: true,
    required: true,
    render: (date) => new Date(date).toLocaleString(),
  },
  {
    title: "Maximum Size",
    dataIndex: "max_size",
    key: "max_size",
    type: "number",
    editable: true,
    required: true,
  },
];

const EventPage: React.FC = () => {
  const { user, events, setEvents } = useContext(GlobalStateContext);
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
            func: async (data) => router.navigate(data.id + "/teams"),
          },
          {
            name: "Scoring Categories",
            func: async (data) =>
              router.navigate(
                `/events/${data.id}/scoring-categories/${data.scoring_category_id}`
              ),
          },
          {
            name: "Scoring Presets",
            func: async (data) =>
              router.navigate(`/events/${data.id}/scoring-presets/`),
          },
        ]}
      />
    </div>
  );
};

export default EventPage;
