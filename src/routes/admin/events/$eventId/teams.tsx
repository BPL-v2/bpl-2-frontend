import { createFileRoute } from "@tanstack/react-router";
import { useContext, useMemo } from "react";
import { useParams } from "@tanstack/react-router";
import { GlobalStateContext } from "@utils/context-provider";
import CrudTable, { CrudColumn } from "@components/crudtable";
import { teamApi } from "@client/client";
import { GameVersion, Permission, Team } from "@client/api";
import { requiresAdmin } from "@utils/token";

export const Route = createFileRoute("/admin/events/$eventId/teams")({
  component: requiresAdmin(TeamPage),
  params: {
    parse: (params) => ({
      eventId: Number(params.eventId),
    }),
    stringify: (params) => ({
      eventId: params.eventId.toString(),
    }),
  },
});

function TeamPage() {
  const { events, user } = useContext(GlobalStateContext);
  let { eventId } = useParams({ from: Route.id });

  const event = events.find((event) => event.id === eventId);
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
  if (!event || !eventId) {
    return <></>;
  }

  if (!user || !user.permissions.includes(Permission.admin)) {
    return <div>You do not have permission to view this page</div>;
  }

  return (
    <>
      <CrudTable<Team>
        resourceName="Team"
        columns={columns}
        fetchFunction={() => teamApi.getTeams(eventId)}
        createFunction={(data) =>
          teamApi.createTeam(eventId, { ...data, eventId: eventId })
        }
        editFunction={(data) =>
          teamApi.createTeam(eventId, { ...data, eventId: eventId })
        }
        deleteFunction={(data) => teamApi.deleteTeam(eventId, data.id)}
      />
    </>
  );
}

export default TeamPage;
