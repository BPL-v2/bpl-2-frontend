import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import "../App.css";
import { JSX, useContext, useMemo } from "react";

import {
  BookOpenIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { GlobalStateContext } from "@utils/context-provider";
import ApplicationButton from "@components/application-button";
import AuthButton from "@components/auth-button";

import { TwitchFilled } from "@icons/twitch";
import { Footer } from "@components/footer";
import { useGetEventStatus, useGetUser } from "@client/query";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => {
    return (
      <div className="flex flex-col gap-8 mt-8 mx-auto ">
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
        icon: <img className="h-10" src="/assets/app-logos/bpl-logo.png" />,
        url: "/",
        visible: true,
      },
      {
        label: "Admin",
        icon: <Cog6ToothIcon className="h-6 w-6" />,
        url: "/admin",
        visible:
          (user?.permissions?.length || 0) > 0 || eventStatus?.is_team_lead,
      },
      {
        label: "Scoring",
        icon: <ChartBarIcon className="h-6 w-6" />,
        url: "/scores",
        visible: true,
      },
      {
        label: "Streams",
        icon: <TwitchFilled className="h-6 w-6" />,
        url: "/streams",
        visible: true,
      },
      {
        label: "Rules",
        icon: <BookOpenIcon className="h-6 w-6" />,
        url: "/rules",
        visible: true,
      },
    ];
    return menu.filter((item) => item.visible);
  }, [eventStatus, user]);

  return (
    <>
      <div className="max-w-[1440px] text-center mx-auto ">
        <div className="text-xl p-0 flex items-center ">
          <ul className="navbar bg-base-200">
            <div className="flex flex-1 justify-left gap-1 sm:gap-2 xl:gap-4">
              {menu.map((item) => (
                <li key={item.url}>
                  <Link
                    to={item.url}
                    className="btn flex items-center gap-2 h-16 font-semibold text-xl btn-sm lg:btn-md"
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
            </div>
            {/* {isAdmin() ? <EventPicker /> : null} */}
            <div tabIndex={0} className=" flex items-center">
              <ApplicationButton />
              <AuthButton />
            </div>
          </ul>
        </div>
        <div className="min-h-[79vh] mb-4">
          {user && !user.account_name && (
            <div className="bg-error text-error-content p-4 text-lg">
              Looks like you haven't connected your PoE Account yet, make sure
              to connect by logging in in the top right corner to connect your
              account so that we can track your characters progress.
            </div>
          )}{" "}
          <Outlet />
        </div>
        <Footer></Footer>
      </div>
    </>
  );
}

export default RootComponent;
