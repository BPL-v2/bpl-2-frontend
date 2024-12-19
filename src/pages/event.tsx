import React from "react";
import { BPLEvent } from "../types/event";
import CrudTable, { CrudColumn } from "../components/crudtable";
import {
  createEvent,
  deleteEvent,
  fetchAllEvents,
  updateEvent,
} from "../client/event-client";
import { router } from "../router";

const columns: CrudColumn<BPLEvent>[] = [
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
  },
  {
    title: "Current",
    dataIndex: "is_current",
    key: "is_current",
    type: "checkbox",
    editable: true,
    render: (_, event) => (event.is_current ? "Yes" : "No"),
  },
];

const EventPage: React.FC = () => {
  return (
    <div className="">
      <CrudTable<BPLEvent>
        resourceName="Event"
        columns={columns}
        fetchFunction={fetchAllEvents}
        createFunction={createEvent}
        editFunction={updateEvent}
        deleteFunction={deleteEvent}
        addtionalActions={{
          Teams: async (data) => router.navigate(data.id + "/teams"),
          "Scoring Categories": async (data) =>
            router.navigate("/scoring-categories/" + data.scoring_category_id),
          "Scoring Presets": async (data) =>
            router.navigate("/scoring-presets/" + data.id),
        }}
      />
    </div>
  );
};

export default EventPage;
