import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { JSX } from "react";

export const Route = createFileRoute("/team")({
  component: RouteComponent,
});
type teamTabKey = "wishlist" | "stashes" | "atlas";

function RouteComponent() {
  const tabs: {
    key: teamTabKey;
    name: string;
    visible: boolean;
    rules?: JSX.Element;
  }[] = [
    {
      name: "Wishlist",
      key: "wishlist",
      visible: true,
    },
    {
      name: "Guild Stash",
      key: "stashes",
      visible: true,
    },
    {
      name: "Atlas",
      key: "atlas",
      visible: true,
    },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between rounded-b-box bg-base-300 shadow-xl">
        <ul className="menu menu-horizontal md:gap-2">
          {tabs.map((tab) => (
            <li key={tab.key}>
              <Link
                to={`/team/${tab.key}`}
                className={"btn text-base btn-xs md:btn-sm"}
                activeProps={{
                  className: "btn-primary",
                }}
                inactiveProps={{
                  className: "btn-ghost hover:btn-primary",
                }}
              >
                {tab.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <Outlet />
    </div>
  );
}
