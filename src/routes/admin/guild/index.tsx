import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/guild/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-row gap-4 mt-4">
      <Link
        to={"/admin/guild/stashes"}
        className="card bg-base-300 hover:bg-base-200 border-2 border-base-content w-100"
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
        className="card bg-base-300 hover:bg-base-200 border-2 border-base-content w-100"
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
