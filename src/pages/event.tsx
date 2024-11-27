import React from "react";
import { BPLEvent } from "../types/event";
import CrudTable, { CrudColumn } from "../components/crudtable";
import {
  createEvent,
  deleteEvent,
  fetchAllEvents,
  updateEvent,
} from "../client/event_client";
import { router } from "../App";

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
  const token = "token";
  return (
    <div className="">
      <CrudTable<BPLEvent>
        resourceName="Event"
        columns={columns}
        fetchFunction={fetchAllEvents}
        createFunction={async (data) => {
          return createEvent(data, token);
        }}
        editFunction={async (data) => {
          return updateEvent(data, token);
        }}
        deleteFunction={async (data) => {
          return deleteEvent(data, token);
        }}
        addtionalActions={{
          Teams: async (data) => router.navigate(data.id + "/teams"),
          "Scoring Categories": async (data) =>
            router.navigate("/scoring-categories/" + data.scoring_category_id),
        }}
      />
    </div>
  );
};

export default EventPage;
