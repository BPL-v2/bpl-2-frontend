import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import "../App.css";
import { JSX, useContext, useMemo } from "react";

import {
  BookOpenIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { GlobalStateContext } from "@utils/context-provider";
import { EventPicker } from "@components/event-picker";
import ApplicationButton from "@components/application-button";
import AuthButton from "@components/auth-button";

import { TwitchFilled } from "@icons/twitch";
import { Footer } from "@components/footer";
import { isAdmin } from "@utils/token";
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
  const { data: user } = useGetUser();
  const { data: eventStatus } = useGetEventStatus(currentEvent.id);
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

  const userIsMissingDiscord = user && !user.discord_id;
  const userIsMissingPoE = user && !user.account_name;
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
            {isAdmin() ? <EventPicker /> : null}
            <div tabIndex={0} className=" flex items-center">
              <ApplicationButton />
              <AuthButton />
            </div>
          </ul>
        </div>
        <div className="min-h-[79vh] mb-4">
          {(userIsMissingPoE || userIsMissingDiscord) && (
            <div className="alert alert-error text-lg">
              <p>
                We messed up and somehow you dont have your discord or poe
                account linked, sorry! Please make sure to head over to{" "}
                <Link to="/settings" className="link">
                  settings
                </Link>{" "}
                and link your accounts so that we can track you during the event
                and give you roles on discord.
              </p>
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
