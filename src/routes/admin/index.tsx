import { Permission } from "@client/api";
import { createFileRoute, Link } from "@tanstack/react-router";
import { GlobalStateContext } from "@utils/context-provider";
import { renderConditionally } from "@utils/token";
import { useContext } from "react";

export const Route = createFileRoute("/admin/")({
  component: renderConditionally(RouteComponent, [
    Permission.admin,
    Permission.manager,
    Permission.objective_designer,
    Permission.submission_judge,
  ]),
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
  const { user } = useContext(GlobalStateContext);
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
  return (
    <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
        title="Monitoring"
        description="View the status of the server and its components."
        link="https://v2202503259898322516.goodsrv.de/monitoring"
        permissions={[Permission.admin]}
      />
    </div>
  );
}
