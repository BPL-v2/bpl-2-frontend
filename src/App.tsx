import "./App.css";
import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import AuthButton from "./components/auth-button";
import { ContextProvider } from "./utils/context-provider";
import { MinimalUser, User, UserPermission } from "./types/user";
import { fetchUsersForEvent, getUserInfo } from "./client/user-client";
import { router } from "./router";
import { fetchAllEvents, fetchEventStatus } from "./client/event-client";
import { BPLEvent, EventStatus } from "./types/event";
import { useError } from "./components/errorcontext";
import {
  LineChartOutlined,
  ReadOutlined,
  SettingOutlined,
  TwitchOutlined,
} from "@ant-design/icons";
import { ScoringCategory } from "./types/scoring-category";
import { fetchCategoryForEvent } from "./client/category-client";
import { establishScoreSocket } from "./client/score-client";
import { ScoreCategory, ScoreMap } from "./types/score";
import { mergeScores } from "./utils/utils";
import { fetchScoringPresetsForEvent } from "./client/scoring-preset-client";
import { ScoringPreset } from "./types/scoring-preset";
import ApplicationButton from "./components/application-button";
import { scoringTabs } from "./pages/scoring-page";

function getKeys(items: any[]): string[] {
  let keys = [];
  for (let item of items) {
    keys.push(item.key);
    if (item.children) {
      keys.push(...getKeys(item.children));
    }
  }
  return keys;
}

function App() {
  const [currentNav, setCurrentNav] = useState<string>();
  const [user, setUser] = useState<User>();
  const [currentEvent, setCurrentEvent] = useState<BPLEvent>();
  const [events, setEvents] = useState<BPLEvent[]>([]);
  const [eventStatus, setEventStatus] = useState<EventStatus>();
  const [rules, setRules] = useState<ScoringCategory>();
  const [scoreData, setScoreData] = useState<ScoreMap>({});
  const [scores, setScores] = useState<ScoreCategory>();
  const [scoringPresets, setScoringPresets] = useState<ScoringPreset[]>();
  const [users, setUsers] = useState<MinimalUser[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  // const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [gameVersion, setGameVersion] = useState<"poe1" | "poe2">("poe1");
  useEffect(() => {
    getUserInfo().then((data) => setUser(data));
    fetchAllEvents().then((events) => {
      setEvents(events);
      const event = events.find((event) => event.is_current);
      setCurrentEvent(event);
      if (event) {
        establishScoreSocket(event.id, setScoreData);
        setGameVersion(event.game_version);
        fetchCategoryForEvent(event.id).then((rules) => setRules(rules));
        fetchScoringPresetsForEvent(event.id).then((presets) =>
          setScoringPresets(presets)
        );
        fetchUsersForEvent(event.id).then((users) => setUsers(users));
      }
    });
  }, []);
  useEffect(() => {
    const items = [
      {
        label: "Admin",
        key: "Admin",
        icon: <SettingOutlined />,
        extra: "right",
        rolerequired: [UserPermission.ADMIN],
        children: [
          { label: "Events", key: "/events" },
          { label: "Manage users", key: "/users" },
          {
            label: "Sort users",
            key: `/events/${currentEvent?.id}/users/sort`,
          },
        ],
      },
      {
        label: "Scoring",
        key: "/scores",
        icon: <LineChartOutlined />,
        // scoring subtabs are only shown in mobile view here
        children: isMobile
          ? scoringTabs.map((tab) => ({
              label: tab.key,
              key: `/scores?tab=${tab.key}`,
            }))
          : undefined,
      },
      {
        label: "Streams",
        key: "/streams",
        icon: <TwitchOutlined />,
      },
      {
        label: "Rules",
        key: "/rules",
        icon: <ReadOutlined />,
      },
    ];
    for (let key of getKeys(items)) {
      if (window.location.pathname.includes(key)) {
        setCurrentNav(key);
        break;
      }
    }
    // setMenuItems(filterMenuItems(items, user));
  }, [isMobile, user]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentEvent]);

  useEffect(() => {
    if (rules && scoreData && currentEvent && scoringPresets) {
      setScores(
        mergeScores(
          rules,
          scoreData,
          currentEvent?.teams.map((team) => team.id),
          scoringPresets
        )
      );
    }
  }, [rules, scoreData, currentEvent, scoringPresets]);

  useEffect(() => {
    if (currentEvent && user) {
      fetchEventStatus(currentEvent.id).then((status) =>
        setEventStatus(status)
      );
    }
  }, [currentEvent, user]);

  const sendNotification = useError().sendNotification;

  useEffect(() => {
    window.addEventListener("error", handleError);
  }, []);
  const handleError = (a: ErrorEvent) => {
    console.log("HANDLING ERROR");
    sendNotification(a.message, "error");
  };

  useEffect(() => {
    window.addEventListener("warning", handleWarning);
  });
  const handleWarning = (a: Event) => {
    sendNotification((a as CustomEvent).detail, "warning");
  };

  useEffect(() => {
    window.addEventListener("success", handleSuccess);
  });
  const handleSuccess = (a: Event) => {
    sendNotification((a as CustomEvent).detail, "success");
  };
  const closeDropdown = () => {
    const elem = document.activeElement as HTMLElement;
    if (elem) {
      elem.blur();
    }
  };

  const menu = [
    {
      label: (
        <>
          <SettingOutlined /> Admin
        </>
      ),
      key: "admin",
      rolerequired: [UserPermission.ADMIN],
      children: [
        { label: "Events", url: "/events", key: "events" },
        { label: "Manage users", url: "/users", key: "users" },
        {
          label: "Sort users",
          url: `/events/${currentEvent?.id}/users/sort`,
          key: "sort-users",
        },
      ],
    },
    {
      label: (
        <>
          <LineChartOutlined /> Scoring
        </>
      ),
      url: "/scores",
      key: "scores",
      // scoring subtabs are only shown in mobile view here
      children: isMobile
        ? scoringTabs.map((tab) => ({
            label: tab.key,
            url: `/scores?tab=${tab.key}`,
            key: tab.key,
          }))
        : undefined,
    },
    {
      label: (
        <>
          <TwitchOutlined /> Streams
        </>
      ),
      url: "/streams",
      key: "streams",
    },
    {
      label: (
        <>
          <ReadOutlined /> Rules
        </>
      ),
      url: "/rules",
      key: "rules",
    },
  ];

  return (
    <>
      <ContextProvider
        value={{
          user: user,
          setUser: setUser,
          currentEvent: currentEvent,
          setCurrentEvent: setCurrentEvent,
          events: events,
          setEvents: setEvents,
          rules: rules,
          setRules: setRules,
          eventStatus: eventStatus,
          setEventStatus: setEventStatus,
          scores: scores,
          setScores: setScores,
          users: users,
          setUsers: setUsers,
          isMobile: isMobile,
          setIsMobile: setIsMobile,
          gameVersion: gameVersion,
          setGameVersion: setGameVersion,
        }}
      >
        <div className="max-w-[1440px] text-center mx-auto ">
          <div className="text-2xl p-0 flex items-center justify-between h-14">
            <ul className="navbar bg-base-200 w-full gap-2 h-14 text-xl">
              {isMobile ? null : (
                <button
                  className="btn h-14 w-40 bg-base-200 text-white text-4xl font-bold"
                  onClick={() => {
                    setCurrentNav("/");
                    router.navigate("/");
                  }}
                >
                  <img className="h-10" src="assets/app-logos/bpl-logo.png" />
                  BPL
                </button>
              )}
              <div className="flex flex-1 justify-left px-2 gap-2 ">
                {menu
                  .filter((item) =>
                    item.rolerequired
                      ? item.rolerequired.some((role) =>
                          user?.permissions?.includes(role)
                        )
                      : true
                  )
                  .map((item) => (
                    <li className=" m-2" key={item.key}>
                      <a
                        className={`dropdown dropdown-hover ${
                          currentNav === item.key
                            ? "bg-primary text-primary-content"
                            : ""
                        }`}
                        onClick={() => {
                          setCurrentNav(item.key);
                          if (item.url) {
                            router.navigate(item.url);
                          }
                        }}
                      >
                        <div
                          tabIndex={0}
                          role="button"
                          className="btn btn-ghost hover:bg-base-300 text-xl h-14 rounded-none"
                        >
                          {item.label}
                        </div>
                        {item.children && (
                          <ul
                            tabIndex={0}
                            className="dropdown-content menu bg-base-300 z-[1] w-50 shadow"
                          >
                            {item.children.map((child) => (
                              <li key={child.key} onClick={closeDropdown}>
                                <div
                                  className="bg-base-300 text-base-content hover:bg-primary hover:text-primary-content "
                                  onClick={() => {
                                    setCurrentNav(child.key);
                                    if (child.url) {
                                      router.navigate(child.url);
                                    }
                                  }}
                                >
                                  {child.label}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}{" "}
                      </a>
                    </li>
                  ))}
              </div>
              <div tabIndex={0} className="h-full">
                <ApplicationButton />
                <AuthButton />
              </div>
            </ul>
          </div>
          <div className="min-h-[80vh]">
            <RouterProvider router={router} />
          </div>
          <div className="bg-base-200  p-4 text-center mt-20">
            This product isn't affiliated with or endorsed by Grinding Gear
            Games in any way.
          </div>
        </div>
      </ContextProvider>
    </>
  );

  return;
}

export default App;
