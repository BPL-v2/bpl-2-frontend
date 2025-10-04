import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { JSX, useContext, useMemo } from "react";
import "../App.css";

import AuthButton from "@components/auth-button";
import {
  BookOpenIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { GlobalStateContext } from "@utils/context-provider";

import { useGetEventStatus, useGetUser } from "@client/query";
import { Footer } from "@components/footer";
import { TwitchFilled } from "@icons/twitch";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => {
    return (
      <div className="mx-auto mt-8 flex flex-col gap-8">
        <h1 className="text-2xl">Could not find page</h1>
        <Link className="link link-info" to="/">
          Return to home page
        </Link>
      </div>
    );
  },
});

type MenuItem = {
  label: string | JSX.Element;
  url: string;
  icon?: JSX.Element;
  visible?: boolean;
};

function RootComponent() {
  const { currentEvent } = useContext(GlobalStateContext);
  const { user } = useGetUser();
  const { eventStatus } = useGetEventStatus(currentEvent.id);
  const menu: MenuItem[] = useMemo(() => {
    const menu: MenuItem[] = [
      {
        label: <div className="text-4xl font-bold">BPL</div>,
        icon: (
          <img
            className="h-12"
            src="/assets/app-logos/bpl-logo.webp"
            alt="bpl-logo"
          />
        ),
        url: "/",
        visible: true,
      },
      {
        label: "Scoring",
        icon: <ChartBarIcon className="size-6" />,
        url: "/scores/ladder",
        visible: true,
      },
      {
        label: "Streams",
        icon: <TwitchFilled className="size-6" />,
        url: "/streams",
        visible: true,
      },
      {
        label: "Rules",
        icon: <BookOpenIcon className="size-6" />,
        url: "/rules",
        visible: true,
      },
      {
        label: "Admin",
        icon: <Cog6ToothIcon className="size-6" />,
        url: "/admin",
        visible:
          (user?.permissions?.length || 0) > 0 || eventStatus?.is_team_lead,
      },
    ];
    return menu.filter((item) => item.visible);
  }, [eventStatus, user]);

  return (
    <>
      <div className="mx-auto max-w-[1440px] text-center">
        <div className="flex items-center p-0 text-xl">
          <div className="navbar bg-base-200">
            <ul className="justify-left flex flex-1 gap-1 sm:gap-2 xl:gap-4">
              {menu.map((item) => (
                <li key={item.url}>
                  <Link
                    aria-label={item.label.toString()}
                    to={item.url}
                    className="btn flex h-16 items-center gap-2 text-xl font-semibold btn-sm lg:btn-md"
                    activeProps={{
                      className: "btn-primary",
                    }}
                    inactiveProps={{
                      className: "btn-ghost hover:btn-primary",
                    }}
                  >
                    {item.icon}
                    <div className="hidden lg:block">{item.label}</div>
                  </Link>
                </li>
              ))}
            </ul>
            <AuthButton />
          </div>
        </div>
        <div className="mb-4 min-h-[79vh]">
          {user && !user.account_name && (
            <div className="bg-error p-4 text-lg text-error-content">
              Looks like you haven't connected your PoE Account yet, make sure
              to connect by logging in in the top right corner to connect your
              account so that we can track your characters progress.
            </div>
          )}
          <Outlet />
        </div>
        <Footer></Footer>
      </div>
    </>
  );
}

export default RootComponent;
