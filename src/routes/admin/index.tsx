import { createFileRoute, Link } from "@tanstack/react-router";
import { requiresAdmin } from "@utils/token";

export const Route = createFileRoute("/admin/")({
  component: requiresAdmin(RouteComponent),
});

function RouteComponent() {
  return (
    <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Link to={"/admin/events"} className="card bg-base-300 hover:bg-base-200">
        <div className="card-body">
          <h2 className="card-title">Event Management</h2>
          <p>
            Manage new events and their settings including teams and objectives.
          </p>
        </div>
      </Link>
      <Link
        to={"/admin/recurring-jobs"}
        className="card bg-base-300 hover:bg-base-200"
      >
        <div className="card-body">
          <h2 className="card-title">Recurring Jobs</h2>
          <p>
            Manage recurring jobs during the event like fetching stash tabs or
            player characters.
          </p>
        </div>
      </Link>
      <Link
        to={"/admin/team-sort"}
        className="card bg-base-300 hover:bg-base-200"
      >
        <div className="card-body">
          <h2 className="card-title">Sort Users</h2>
          <p>Sort users into teams.</p>
        </div>
      </Link>
      <Link
        to={"/admin/user-management"}
        className="card bg-base-300 hover:bg-base-200"
      >
        <div className="card-body">
          <h2 className="card-title">User Management</h2>
          <p>Manage user roles.</p>
        </div>
      </Link>
      <a
        href="/monitoring"
        className="card bg-base-300 hover:bg-base-200"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="card-body">
          <h2 className="card-title">Monitoring</h2>
          <p>View the status of the server and its components.</p>
        </div>
      </a>
    </div>
  );
}
