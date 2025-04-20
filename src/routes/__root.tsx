import {
  Link,
  Outlet,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import "../App.css";
import { JSX, useContext, useEffect, useMemo, useState } from "react";

import { Permission } from "@client/api";
import {
  BookOpenIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { GlobalStateContext } from "@utils/context-provider";
import { EventPicker } from "@components/event-picker";
import ApplicationButton from "@components/application-button";
import AuthButton from "@components/auth-button";

import { TwitchFilled } from "@icons/twitch";
import { Footer } from "@components/footer";
import { router } from "../router";

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
  key: string;
  icon?: JSX.Element;
  extra?: "left" | "right";
  visible?: boolean;
  children?: MenuItem[];
  url?: string;
  external?: boolean;
};

function RootComponent(props: { children: JSX.Element }) {
  const { currentEvent, user, eventStatus, isMobile } =
    useContext(GlobalStateContext);
  const [currentNav, setCurrentNav] = useState<string>();
  const menu: MenuItem[] = useMemo(() => {
    const menu: MenuItem[] = [
      {
        label: "Admin",
        icon: <Cog6ToothIcon className="h-6 w-6" />,
        key: "admin",
        url: "/admin",
        visible: user?.permissions?.includes(Permission.admin),
      },
      {
        label: "Team",
        icon: <WrenchScrewdriverIcon className="h-6 w-6" />,
        key: "teamleads",
        visible: eventStatus?.is_team_lead,
        children: [
          { label: "Focus", url: "/team-suggestions", key: "team-suggestions" },
        ],
      },
      {
        label: "Scoring",
        icon: <ChartBarIcon className="h-6 w-6" />,
        url: "/scores/ladder",
        key: "scores",
        visible: true,
      },
      {
        label: "Streams",
        icon: <TwitchFilled className="h-6 w-6" />,
        url: "/streams",
        key: "streams",
        visible: true,
      },
      {
        label: "Rules",
        icon: <BookOpenIcon className="h-6 w-6" />,
        url: "/rules",
        key: "rules",
        visible: true,
      },
    ];
    return menu.filter((item) => item.visible);
  }, [currentEvent, eventStatus]);
  const selected = useRouterState({
    select: (state) => state.location.pathname,
  });

  useEffect(() => {
    setCurrentNav(router.state.location.pathname.split("/")[1]);
  }, []);
  console.log("selected", selected);
  return (
    <>
      <div className="max-w-[1440px] text-center mx-auto ">
        <div className="text-xl p-0 flex items-center ">
          <ul
            className={`navbar bg-base-200 ${
              currentNav === "scores" ? "" : "rounded-b-box"
            }`}
          >
            <Link
              to="/"
              target="_self"
              className={`btn py-8 hover:bg-primary hover:text-primary-content ${
                selected === "/" ? " bg-primary text-primary-content " : ""
              }`}
            >
              <img className="h-10" src="/assets/app-logos/bpl-logo.png" />
              <div className="text-4xl font-bold hidden sm:block">BPL</div>
            </Link>
            <div className="flex flex-1 justify-left gap-0">
              {menu.map((item) => (
                <li
                  className={`m-0 sm:mx-2  rounded-field hover:bg-primary hover:text-primary-content ${
                    selected.includes(item.key)
                      ? "bg-primary text-primary-content "
                      : ""
                  }`}
                  key={item.key}
                >
                  <div className="font-semibold">
                    {item.children ? (
                      <div
                        tabIndex={0}
                        className="dropdown cursor-pointer select-none"
                        role="button"
                      >
                        <div className="flex flex-row gap-2 m-4">
                          {item.icon}
                          <div className="hidden lg:block">{item.label}</div>
                        </div>
                        <ul
                          tabIndex={0}
                          className="dropdown-content menu bg-base-300 border-2 border-base-100 z-1 w-52 p-2 shadow-sm text-base-content text-lg rounded-field"
                          onClick={(e) => {
                            if (document.activeElement instanceof HTMLElement) {
                              document.activeElement?.blur();
                            }
                          }}
                        ></ul>
                      </div>
                    ) : (
                      <Link
                        to={item.url}
                        target="_self"
                        onClick={(e) => {
                          if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                            setCurrentNav(item.key);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        className=" text-xl flex items-center h-15 p-4 gap-2"
                      >
                        {item.icon}
                        <div className="hidden lg:block">{item.label}</div>
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </div>
            {isMobile ? null : <EventPicker />}
            <div tabIndex={0} className=" flex items-center">
              {isMobile ? null : <ApplicationButton />}
              <AuthButton />
            </div>
          </ul>
        </div>
        <div className="min-h-[79vh] mb-4">
          <Outlet />
        </div>
        <Footer></Footer>
      </div>
    </>
  );
}

export default RootComponent;
