import React, { useContext, useMemo } from "react";
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

const TeamPage: React.FC = () => {
  let { eventId } = useParams();
  if (!eventId) {
    return <></>;
  }
  const { user, gameVersion } = useContext(GlobalStateContext);
  if (!user || !user.permissions.includes(UserPermission.ADMIN)) {
    return <div>You do not have permission to view this page</div>;
  }
  const columns: CrudColumn<Team>[] = useMemo(
    () => [
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
        options:
          // public/assets/poe1/ascendancies/thumbnails/Ascendant.png public/assets/poe1/ascendancies/thumbnails/Assassin.png public/assets/poe1/ascendancies/thumbnails/Berserker.png public/assets/poe1/ascendancies/thumbnails/Champion.png public/assets/poe1/ascendancies/thumbnails/Chieftain.png public/assets/poe1/ascendancies/thumbnails/Deadeye.png public/assets/poe1/ascendancies/thumbnails/Duelist.png public/assets/poe1/ascendancies/thumbnails/Elementalist.png public/assets/poe1/ascendancies/thumbnails/Gladiator.png public/assets/poe1/ascendancies/thumbnails/Guardian.png public/assets/poe1/ascendancies/thumbnails/Hierophant.png public/assets/poe1/ascendancies/thumbnails/Inquisitor.png public/assets/poe1/ascendancies/thumbnails/Juggernaut.png public/assets/poe1/ascendancies/thumbnails/Marauder.png public/assets/poe1/ascendancies/thumbnails/Necromancer.png public/assets/poe1/ascendancies/thumbnails/Occultist.png public/assets/poe1/ascendancies/thumbnails/Pathfinder.png public/assets/poe1/ascendancies/thumbnails/Ranger.png public/assets/poe1/ascendancies/thumbnails/Saboteur.png public/assets/poe1/ascendancies/thumbnails/Scion.png public/assets/poe1/ascendancies/thumbnails/Shadow.png public/assets/poe1/ascendancies/thumbnails/Slayer.png public/assets/poe1/ascendancies/thumbnails/Templar.png public/assets/poe1/ascendancies/thumbnails/Trickster.png public/assets/poe1/ascendancies/thumbnails/Warden.png public/assets/poe1/ascendancies/thumbnails/Witch.png

          gameVersion === "poe2"
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
              ],

        editable: true,
        render: (_, team) => team.allowed_classes.join(", "),
      },
    ],
    [gameVersion]
  );

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
