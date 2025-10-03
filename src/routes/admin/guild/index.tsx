import { useGetEventStatus } from "@client/query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { GlobalStateContext } from "@utils/context-provider";
import { getPermissions } from "@utils/token";
import { useContext } from "react";

export const Route = createFileRoute("/admin/guild/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { currentEvent } = useContext(GlobalStateContext);
  const { eventStatus } = useGetEventStatus(currentEvent.id);
  const permissions = getPermissions();
  if (permissions.length === 0 && !eventStatus?.is_team_lead) {
    return "You do not have permission to view this page.";
  }
  return (
    <div className="mt-4 flex flex-row gap-4">
      <Link
        to={"/admin/guild/stashes"}
        className="card w-100 border-2 border-base-content bg-base-300 hover:bg-base-200"
      >
        <div className="card-body">
          <h2 className="card-title">Stash Management</h2>
          <p className="text-left">
            View the current state of your Guild Stash and select which stash
            tabs should be monitored
          </p>
        </div>
      </Link>
      <Link
        to={"/admin/guild/logs"}
        className="card w-100 border-2 border-base-content bg-base-300 hover:bg-base-200"
      >
        <div className="card-body">
          <h2 className="card-title">Stash Logs</h2>
          <p className="text-left">
            View the history of changes made to your Guild Stash
          </p>
        </div>
      </Link>
    </div>
  );
}
