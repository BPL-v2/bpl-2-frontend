import { Permission } from "@client/api";
import { useGetEventStatus, useGetUser } from "@client/query";
import { EventPicker } from "@components/event-picker";
import { createFileRoute, Link } from "@tanstack/react-router";
import { GlobalStateContext } from "@utils/context-provider";
import { getPermissions } from "@utils/token";
import { useContext } from "react";

export const Route = createFileRoute("/admin/")({
  component: RouteComponent,
});

function AdminRouteCard({
  title,
  description,
  link,
  permissions,
}: {
  title: string;
  description: string;
  link: string;
  permissions: Permission[];
}) {
  const { user } = useGetUser();
  const hasPermission = permissions.some((permission) =>
    user?.permissions.includes(permission)
  );
  if (!hasPermission) {
    return null;
  }
  return (
    <Link
      to={link}
      className="card bg-base-300 hover:bg-base-200 border-2 border-base-content"
    >
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <p className="text-left">{description}</p>
      </div>
    </Link>
  );
}

function RouteComponent() {
  const permissions = getPermissions();
  const { currentEvent } = useContext(GlobalStateContext);
  const { eventStatus } = useGetEventStatus(currentEvent.id);
  if (permissions.length === 0 && !eventStatus?.is_team_lead) {
    return "You do not have permission to view this page.";
  }
  return (
    <div className="flex flex-col gap-4 mt-4">
      {permissions.length > 0 && <EventPicker />}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <AdminRouteCard
          title="Event Management"
          description="Manage new events and their settings including teams and objectives."
          link="/admin/events"
          permissions={[Permission.admin, Permission.objective_designer]}
        />
        <AdminRouteCard
          title="Recurring Jobs"
          description="Manage recurring jobs during the event like fetching stash tabs or player characters."
          link="/admin/recurring-jobs"
          permissions={[Permission.admin]}
        />
        <AdminRouteCard
          title="Sort Users"
          description="Sort users into teams."
          link="/admin/team-sort"
          permissions={[Permission.admin, Permission.manager]}
        />
        <AdminRouteCard
          title="User Management"
          description="Manage user roles."
          link="/admin/user-management"
          permissions={[Permission.admin]}
        />
        <AdminRouteCard
          title="Submission Management"
          description="Manage race/bounty submissions."
          link="/admin/submissions"
          permissions={[Permission.admin, Permission.submission_judge]}
        />
        <AdminRouteCard
          title="Monitoring"
          description="View the status of the server and its components."
          link="https://v2202503259898322516.goodsrv.de/monitoring"
          permissions={[Permission.admin]}
        />
        {eventStatus && eventStatus.is_team_lead && (
          <>
            <Link
              to={"/admin/team-suggestions"}
              className="card bg-base-300 hover:bg-base-200 border-2 border-base-content"
            >
              <div className="card-body">
                <h2 className="card-title">Team Content Suggestions</h2>
                <p className="text-left">
                  Team leaders can suggest content for their team to focus on
                  that will show on their member's for-you pages.
                </p>
              </div>
            </Link>
            <Link
              to={"/admin/guild-stashes"}
              className="card bg-base-300 hover:bg-base-200 border-2 border-base-content"
            >
              <div className="card-body">
                <h2 className="card-title">Guild Stash</h2>
                <p className="text-left">
                  Team leaders can monitor the fetch status of guild stash tabs.
                </p>
              </div>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
