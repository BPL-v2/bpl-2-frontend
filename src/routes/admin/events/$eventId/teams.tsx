import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useParams } from "@tanstack/react-router";
import CrudTable, { CrudColumn } from "@components/crudtable";
import { teamApi } from "@client/client";
import { GameVersion, Permission, Team } from "@client/api";
import { renderConditionally } from "@utils/token";
import { useGetEvents } from "@client/query";

export const Route = createFileRoute("/admin/events/$eventId/teams")({
  component: renderConditionally(TeamPage, [
    Permission.admin,
    Permission.objective_designer,
  ]),

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
  let { eventId } = useParams({ from: Route.id });
  const { data: events, isPending, isError } = useGetEvents();
  if (isPending) {
    return <div className="loading loading-spinner loading-lg"></div>;
  }
  if (isError) {
    return <div>Error loading events.</div>;
  }
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
