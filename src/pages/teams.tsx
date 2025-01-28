import React, { useContext } from "react";
import CrudTable, { CrudColumn } from "../components/crudtable";
import { Team } from "../types/team";
import {
  createTeam,
  deleteTeam,
  fetchTeamsForEvent,
} from "../client/team-client";
import { useParams } from "react-router-dom";
import { GlobalStateContext } from "../utils/context-provider";
import { UserPermission } from "../types/user";

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
    type: "multiselect",
    options: [
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
    ],

    editable: true,
    render: (_, team) => team.allowed_classes.join(", "),
  },
];

const TeamPage: React.FC = () => {
  let { eventId } = useParams();
  if (!eventId) {
    return <></>;
  }
  const { user } = useContext(GlobalStateContext);
  if (!user || !user.permissions.includes(UserPermission.ADMIN)) {
    return <div>You do not have permission to view this page</div>;
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
        return createTeam(eventIdNum, data);
      }}
      deleteFunction={async (data) => {
        return deleteTeam(eventIdNum, data);
      }}
    />
  );
};

export default TeamPage;
