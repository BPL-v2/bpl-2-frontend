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
import {
  LineChartOutlined,
  ReadOutlined,
  SettingOutlined,
  TwitchOutlined,
} from "@ant-design/icons";
import { ScoringCategory } from "./types/scoring-category";
import { fetchCategoryForEvent } from "./client/category-client";
import { establishScoreSocket } from "./client/score-client";
import { ScoreCategory, ScoreDiff, ScoreMap } from "./types/score";
import { mergeScores } from "./utils/utils";
import { fetchScoringPresetsForEvent } from "./client/scoring-preset-client";
import { ScoringPreset } from "./types/scoring-preset";
import ApplicationButton from "./components/application-button";
import { Dropdown } from "antd";
import { ScoreUpdateCard } from "./components/score-update-card";

// function getKeys(items: any[]): string[] {
//   let keys = [];
//   for (let item of items) {
//     keys.push(item.key);
//     if (item.children) {
//       keys.push(...getKeys(item.children));
//     }
//   }
//   return keys;
// }

type MenuItem = {
  label: string | JSX.Element;
  key: string;
  icon?: JSX.Element;
  extra?: "left" | "right";
  rolerequired?: UserPermission[];
  children?: MenuItem[];
  url?: string;
};

// hack to get a highlight color
const setHighlightColor = (root: HTMLElement) => {
  // create a new color that is 20% lighter than base-300
  const base300Color = getComputedStyle(root)
    .getPropertyValue("--color-base-300")
    .trim();
  const base200Color = getComputedStyle(root)
    .getPropertyValue("--color-base-200")
    .trim();

  // Regular expression to match oklch color format
  const regex = /oklch\(([\d.]+)% ([\d.]+) ([\d.]+)\)/;

  // Match base-300 color
  const match300 = base300Color.match(regex);
  if (!match300) return;

  // Match base-200 color
  const match200 = base200Color.match(regex);
  if (!match200) return;

  // Extract lightness values
  const [_, l300, c300, h300] = match300.map(Number);
  const [__, l200, _c200, _h200] = match200.map(Number);

  // Switch base-200 and base-300 if base-200 is darker
  if (l200 > l300) {
    root.style.setProperty("--color-base-300", base200Color);
    root.style.setProperty("--color-base-200", base300Color);
  }

  // Create a new color that is 20% lighter than base-300
  const newL = Math.min(100, l300 + 10);
  root.style.setProperty(
    "--color-highlight",
    `oklch(${newL}% ${c300} ${h300})`
  );
};

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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 800);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [gameVersion, setGameVersion] = useState<"poe1" | "poe2">("poe1");
  const [updates, setUpdates] = useState<ScoreDiff[]>([]);
  useEffect(() => {
    setHighlightColor(document.documentElement);
  }, []);

  useEffect(() => {
    getUserInfo().then((data) => setUser(data));
    fetchAllEvents().then((events) => {
      setEvents(events);
      const event = events.find((event) => event.is_current);
      setCurrentEvent(event);
      if (event) {
        establishScoreSocket(event.id, setScoreData, (newUpdates) =>
          setUpdates((prevUpdates) => [...newUpdates, ...prevUpdates])
        );
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
    let menu: MenuItem[] = [
      {
        label: "Admin",
        icon: <SettingOutlined />,
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
        label: "Scoring",
        icon: <LineChartOutlined />,
        url: "/scores",
        key: "scores",
      },
      {
        label: "Streams",
        icon: <TwitchOutlined />,
        url: "/streams",
        key: "streams",
      },
      {
        label: "Rules",
        icon: <ReadOutlined />,
        url: "/rules",
        key: "rules",
      },
    ];
    setMenuItems(menu);
  }, [isMobile, user]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 800);
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
          {updates.length > 0 && (
            <div className="stack fixed top-0 right-0 p-4 gap-1 z-1000 w-120">
              {updates
                .filter(
                  (update) =>
                    Number(update.key.split("-")[2]) === eventStatus?.team_id
                )
                .map((update, index) => {
                  return (
                    <ScoreUpdateCard
                      key={"update-" + index}
                      update={update}
                      close={(update: ScoreDiff) =>
                        setUpdates((prevUpdates) =>
                          prevUpdates.filter((u) => u.key !== update.key)
                        )
                      }
                      closeAll={
                        updates.length > 1 ? () => setUpdates([]) : undefined
                      }
                    />
                  );
                })
                .slice(0, 25)}
            </div>
          )}
          <div className="text-2xl p-0 flex items-center justify-between h-14">
            <ul className="navbar bg-base-200 w-full  h-14 text-xl gap-0 p-0">
              <button
                className="btn btn-ghost h-14 bg-base-200 "
                onClick={() => {
                  setCurrentNav("/");
                  router.navigate("/");
                }}
              >
                <img className="h-10" src="assets/app-logos/bpl-logo.png" />
                <div className="text-4xl font-bold hidden sm:block">BPL</div>
              </button>
              <div className="flex flex-1 justify-left gap-0 ">
                {menuItems
                  .filter((item) =>
                    item.rolerequired
                      ? item.rolerequired.some((role) =>
                          user?.permissions?.includes(role)
                        )
                      : true
                  )
                  .map((item) => (
                    <li
                      className={`m-0 sm:m-2 ${
                        currentNav === item.key
                          ? "bg-primary text-primary-content"
                          : ""
                      }`}
                      onClick={(e) => {
                        if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                          e.preventDefault();
                          setCurrentNav(item.key);
                          if (item.url) {
                            router.navigate(item.url);
                          }
                        }
                      }}
                      key={item.key}
                    >
                      <a href={item.url}>
                        {item.children ? (
                          <Dropdown
                            trigger={["click", "hover"]}
                            menu={{
                              items: item.children?.map((child) => ({
                                label: (
                                  <a
                                    onClick={() => {
                                      setCurrentNav(item.key);
                                      if (child.url) {
                                        router.navigate(child.url);
                                      }
                                    }}
                                  >
                                    {child.label}
                                  </a>
                                ),
                                icon: child.icon,
                                key: child.key,
                                children: child.children?.map((subchild) => ({
                                  label: (
                                    <a
                                      onClick={() => {
                                        setCurrentNav(subchild.key);
                                        if (subchild.url) {
                                          router.navigate(subchild.url);
                                        }
                                      }}
                                    >
                                      {subchild.label}
                                    </a>
                                  ),
                                  key: subchild.label,
                                })),
                              })),
                            }}
                          >
                            <div
                              tabIndex={0}
                              role="button"
                              className="btn btn-ghost hover:bg-base-300 text-xl h-14 rounded-none flex items-center"
                            >
                              {item.icon}
                              <div className="hidden lg:block">
                                {item.label}
                              </div>
                            </div>
                          </Dropdown>
                        ) : (
                          <div
                            tabIndex={0}
                            role="button"
                            className="btn btn-ghost hover:bg-base-300 text-xl h-14 rounded-none flex items-center"
                          >
                            {item.icon}
                            <div className="hidden lg:block">{item.label}</div>
                          </div>
                        )}
                      </a>
                    </li>
                  ))}
              </div>
              <div tabIndex={0} className="h-full">
                {isMobile ? null : <ApplicationButton />}
                <AuthButton />
              </div>
            </ul>
          </div>
          <div className="min-h-[80vh] mb-4">
            <RouterProvider router={router} />
          </div>
          <div className="bg-base-200 p-4 text-center mt-20">
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
