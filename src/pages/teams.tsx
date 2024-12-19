import React from "react";
import CrudTable, { CrudColumn } from "../components/crudtable";
import { Team } from "../types/team";
import {
  createTeam,
  deleteTeam,
  fetchTeamsForEvent,
  updateTeam,
} from "../client/team-client";
import { useParams } from "react-router-dom";

const columns: CrudColumn<Team>[] = [
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
    title: "Allowed Classes",
    dataIndex: "allowed_classes",
    key: "allowed_classes",
    type: "text[]",

    editable: true,
    render: (_, team) => team.allowed_classes.join(", "),
  },
];

const TeamPage: React.FC = () => {
  let { eventId } = useParams();
  if (!eventId) {
    return <></>;
  }
  const eventIdNum = Number(eventId);
  return (
    <CrudTable<Team>
      resourceName="Team"
      columns={columns}
      fetchFunction={() => fetchTeamsForEvent(eventIdNum)}
      createFunction={async (data) => {
        return createTeam(eventIdNum, data);
      }}
      editFunction={async (data) => {
        return updateTeam(eventIdNum, data);
      }}
      deleteFunction={async (data) => {
        return deleteTeam(eventIdNum, data);
      }}
    />
  );
};

export default TeamPage;
