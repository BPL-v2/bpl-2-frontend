import { useGetEventStatus, useGetGuilds } from "@client/query";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { GlobalStateContext } from "@utils/context-provider";
import { useContext } from "react";

export const Route = createFileRoute("/admin/guild/logs")({
  component: RouteComponent,
});

function RouteComponent() {
  const { currentEvent } = useContext(GlobalStateContext);
  const { guilds } = useGetGuilds(currentEvent.id);
  const { eventStatus } = useGetEventStatus(currentEvent.id);

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-4 m-4">
        <div>Choose a guild:</div>
        <div className="join">
          {guilds
            ?.filter((guild) => guild.team_id === eventStatus?.team_id)
            .map((guild) => (
              <Link
                to={`/admin/guild/logs/$guildId`}
                params={{ guildId: guild.guild_id }}
                className="btn join-item btn-primary"
                inactiveProps={{ className: "btn-outline" }}
                key={guild.guild_id}
              >
                {guild.guild_id}
              </Link>
            ))}
        </div>
      </div>
      <Outlet />
    </div>
  );
}
