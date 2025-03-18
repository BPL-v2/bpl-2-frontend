import { useContext, useMemo } from "react";
import CrudTable, { CrudColumn } from "../../components/crudtable";
import { useParams } from "react-router-dom";
import { GlobalStateContext } from "../../utils/context-provider";
import { GameVersion, Permission, Team } from "../../client";
import { teamApi } from "../../client/client";

const TeamPage = () => {
  let { eventId } = useParams();
  const { events, user } = useContext(GlobalStateContext);
  const event = events.find((event) => event.id === Number(eventId));
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
        required: true,
      },
      {
        title: "Color",
        dataIndex: "color",
        key: "color",
        type: "color",
        editable: true,
        render: (_, team) => (
          <div
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: team.color }}
          />
        ),
      },
      {
        title: "Allowed Classes",
        dataIndex: "allowed_classes",
        key: "allowed_classes",
        type: "multiselect",
        options:
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
              ],

        editable: true,
        render: (_, team) => team.allowed_classes.join(", "),
      },
    ],
    [event]
  );
  if (!event) {
    return <></>;
  }

  if (!user || !user.permissions.includes(Permission.admin)) {
    return <div>You do not have permission to view this page</div>;
  }

  const eventIdNum = Number(eventId);
  return (
    <>
      <input
        type="color"
        className="input"
        onChange={(e) => console.log(e.target.value)}
      />

      <CrudTable<Team>
        resourceName="Team"
        columns={columns}
        fetchFunction={() => teamApi.getTeams(eventIdNum)}
        createFunction={(data) =>
          teamApi.createTeam(eventIdNum, { ...data, eventId: eventIdNum })
        }
        editFunction={(data) =>
          teamApi.createTeam(eventIdNum, { ...data, eventId: eventIdNum })
        }
        deleteFunction={(data) => teamApi.deleteTeam(eventIdNum, data.id)}
      />
    </>
  );
};

export default TeamPage;
