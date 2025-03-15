import "./App.css";
import { JSX, useEffect, useMemo, useState } from "react";
import { RouterProvider } from "react-router-dom";
import AuthButton from "./components/auth-button";
import { ContextProvider } from "./utils/context-provider";
import { router } from "./router";
import { establishScoreSocket } from "./websocket/score-socket";
import { ScoreCategory, ScoreDiffWithKey } from "./types/score";
import { mergeScores } from "./utils/utils";
import ApplicationButton from "./components/application-button";

import { ScoreUpdateCard } from "./components/score-update-card";
import {
  Category,
  EventStatus,
  Permission,
  ScoringPreset,
  User,
  Event,
  GameVersion,
  ScoreMap,
  LadderEntry,
} from "./client";
import { MinimalTeamUser } from "./types/user";
import { eventApi, ladderApi, scoringApi, userApi } from "./client/client";
import {
  BookOpenIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { TwitchFilled } from "./icons/twitch";
import { YoutubeFilled } from "./icons/youtube";
import { TwitterFilled } from "./icons/twitter";
import { GithubFilled } from "./icons/github";
import { DiscordFilled } from "./icons/discord";

type MenuItem = {
  label: string | JSX.Element;
  key: string;
  icon?: JSX.Element;
  extra?: "left" | "right";
  rolerequired?: Permission[];
  children?: MenuItem[];
  url?: string;
  external?: boolean;
};

const route = (item: MenuItem) => {
  if (item.url) {
    if (item.external) {
      window.open(item.url, "_blank");
    } else {
      router.navigate(item.url);
    }
  }
};

function App() {
  const [currentNav, setCurrentNav] = useState<string>();
  const [user, setUser] = useState<User>();
  // initialize with a dummy event so that we can start making api calls
  const ev = {
    id: "current",
    teams: [],
  } as unknown as Event;
  const [currentEvent, setCurrentEvent] = useState<Event>(ev);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventStatus, setEventStatus] = useState<EventStatus>();
  const [rules, setRules] = useState<Category>();
  const [scoreData, setScoreData] = useState<ScoreMap>({});
  const [scores, setScores] = useState<ScoreCategory>();
  const [scoringPresets, setScoringPresets] = useState<ScoringPreset[]>();
  const [users, setUsers] = useState<MinimalTeamUser[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 800);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [gameVersion, setGameVersion] = useState<GameVersion>(GameVersion.poe1);
  const [updates, setUpdates] = useState<ScoreDiffWithKey[]>([]);
  const [ladder, setLadder] = useState<LadderEntry[]>([]);
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    document?.querySelector("html")?.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    // @ts-ignore just a manual flag to avoid refetching on initial load
    if (currentEvent.ignoreRefetch) {
      return;
    }
    userApi.getUser().then(setUser);
    establishScoreSocket(currentEvent.id, setScoreData, (newUpdates) =>
      setUpdates((prevUpdates) => [...newUpdates, ...prevUpdates])
    );
    scoringApi.getRulesForEvent(currentEvent.id).then(setRules);
    scoringApi
      .getScoringPresetsForEvent(currentEvent.id)
      .then(setScoringPresets);
    userApi.getUsersForEvent(currentEvent.id).then((users) => {
      setUsers(
        Object.entries(users)
          .map(([teamId, user]) => {
            return user.map((u) => ({ ...u, team_id: parseInt(teamId) }));
          })
          .flat()
      );
    });
    ladderApi.getLadder(currentEvent.id).then(setLadder);
  }, [currentEvent]);

  useEffect(() => {
    eventApi.getEvents().then((events) => {
      setEvents(events);
      const event = events.find((event) => event.is_current);
      if (!event) return;
      // @ts-ignore just a manual flag to avoid refetching on initial load
      setCurrentEvent({ ...event, ignoreRefetch: true });
      setGameVersion(event.game_version);
    });
  }, []);

  useEffect(() => {
    let menu: MenuItem[] = [
      {
        label: "Admin",
        icon: <Cog6ToothIcon className="h-6 w-6" />,
        key: "admin",
        rolerequired: [Permission.admin],
        children: [
          { label: "Events", url: "/events", key: "events" },
          { label: "Manage users", url: "/users", key: "users" },
          {
            label: "Sort users",
            url: `/events/${currentEvent?.id}/users/sort`,
            key: "sort-users",
          },
          {
            label: "Monitoring",
            url: "/monitoring",
            key: "monitoring",
            external: true,
          },
          {
            label: "Recurring Jobs",
            url: "/recurring-jobs",
            key: "recurring-jobs",
          },
        ],
      },
      {
        label: "Scoring",
        icon: <ChartBarIcon className="h-6 w-6" />,
        url: "/scores",
        key: "scores",
      },
      {
        label: "Streams",
        icon: <TwitchFilled className="h-6 w-6" />,
        url: "/streams",
        key: "streams",
      },
      {
        label: "Rules",
        icon: <BookOpenIcon className="h-6 w-6" />,
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
  }, []);

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
      eventApi.getEventStatusForUser(currentEvent.id).then(setEventStatus);
    }
  }, [currentEvent, user]);

  const notifications = useMemo(() => {
    const teamUpdates = updates.filter(
      (update) => Number(update.key.split("-")[2]) === eventStatus?.team_id
    );
    if (teamUpdates.length === 0) return null;

    return (
      <div className="stack fixed top-0 right-0 p-4 gap-1 z-1000 w-120 max-w-full">
        {teamUpdates
          .map((update, index) => {
            return (
              <ScoreUpdateCard
                key={"update-" + index}
                update={update}
                close={(update: ScoreDiffWithKey) =>
                  setUpdates((prevUpdates) =>
                    prevUpdates.filter((u) => u.key !== update.key)
                  )
                }
                closeAll={
                  teamUpdates.length > 1 ? () => setUpdates([]) : undefined
                }
              />
            );
          })
          .slice(0, 25)}
      </div>
    );
  }, [updates]);

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
          ladder: ladder,
          setLadder: setLadder,
        }}
      >
        <div className="max-w-[1440px] text-center mx-auto ">
          {notifications}{" "}
          <div className="text-2xl p-0 flex items-center justify-between h-18">
            <ul className="navbar bg-base-200 w-full  h-full text-xl gap-0 p-0">
              <button
                className="btn btn-ghost h-full rounded-none bg-base-200 hover:bg-base-300"
                onClick={() => {
                  setCurrentNav("/");
                  router.navigate("/");
                }}
              >
                <img className="h-10" src="/assets/app-logos/bpl-logo.png" />
                <div className="text-4xl font-bold hidden sm:block">BPL</div>
              </button>
              <div className="flex flex-1 justify-left gap-0 h-full">
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
                      className={`m-0 sm:mx-2 ${
                        currentNav === item.key
                          ? "bg-primary text-primary-content"
                          : ""
                      }`}
                      onClick={(e) => {
                        if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                          e.preventDefault();
                          setCurrentNav(item.key);
                          route(item);
                        }
                      }}
                      key={item.key}
                    >
                      <a href={item.url}>
                        {item.children ? (
                          <div className="dropdown h-full">
                            <div
                              tabIndex={0}
                              role="button"
                              className="btn btn-ghost hover:bg-base-300 text-xl h-full rounded-none flex items-center"
                            >
                              {item.icon}
                              <div className="hidden lg:block">
                                {item.label}
                              </div>
                            </div>
                            <ul
                              tabIndex={0}
                              className="dropdown-content menu bg-base-300  z-1 w-52 p-2 shadow-sm text-base-content text-lg"
                              onClick={() => {
                                if (
                                  document.activeElement instanceof HTMLElement
                                ) {
                                  document.activeElement?.blur();
                                }
                              }}
                            >
                              {item.children.map((child) => (
                                <li
                                  className={`${
                                    currentNav === child.key
                                      ? "bg-primary text-primary-content"
                                      : ""
                                  }`}
                                  key={child.key}
                                >
                                  <div
                                    onClick={() => {
                                      setCurrentNav(item.key);
                                      route(child);
                                    }}
                                  >
                                    {child.label}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div
                            tabIndex={0}
                            role="button"
                            className="btn btn-ghost hover:bg-base-300 text-xl h-full rounded-none flex items-center"
                          >
                            {item.icon}
                            <div className="hidden lg:block">{item.label}</div>
                          </div>
                        )}
                      </a>
                    </li>
                  ))}
              </div>

              <select
                defaultValue="Pick a theme"
                className="select w-40 mx-4"
                onChange={(e) => setTheme(e.target.value)}
              >
                <option disabled={true}>Pick a theme</option>
                {[
                  "dark",
                  "synthwave",
                  "halloween",
                  "forest",
                  "black",
                  "luxury",
                  "dracula",
                  "business",
                  "night",
                  "coffee",
                  "dim",
                  "sunset",
                  "abyss",
                  "aqua",
                  "cyberpunk",
                  "valentine",
                  "light",
                  "cupcake",
                  "bumblebee",
                  "emerald",
                  "corporate",
                  "retro",
                  "garden",
                  "lofi",
                  "pastel",
                  "fantasy",
                  "wireframe",
                  "cmyk",
                  "autumn",
                  "acid",
                  "lemonade",

                  "winter",
                  "nord",
                  "caramellatte",
                  "silk",
                ].map((theme) => (
                  <option key={theme} value={theme} data-theme={theme}>
                    {theme}
                  </option>
                ))}
              </select>

              <div tabIndex={0} className="h-full">
                {isMobile ? null : <ApplicationButton />}
                <AuthButton />
              </div>
            </ul>
          </div>
          <div className="min-h-[80vh] mb-4">
            <RouterProvider router={router} />
          </div>
          <footer className="footer sm:footer-horizontal bg-base-200 items-center p-4">
            <aside className="grid-flow-col items-center">
              <p>
                This product isn't affiliated with or endorsed by Grinding Gear
                Games in any way.
              </p>
            </aside>
            <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
              <a
                href="https://discord.com/invite/3weG9JACgb"
                target="_blank"
                className="cursor-pointer"
              >
                <DiscordFilled className="h-6 w-6 cursor-pointer" />
              </a>
              <a
                href="https://github.com/Liberatorist/bpl-2"
                target="_blank"
                className="cursor-pointer"
              >
                <GithubFilled className="h-6 w-6 cursor-pointer" />
              </a>
              <a
                href="https://www.twitch.tv/bpl_poe"
                target="_blank"
                className="cursor-pointer"
              >
                <TwitchFilled className="h-6 w-6 cursor-pointer" />
              </a>
              <a
                href="https://www.youtube.com/@BPL-PoE"
                target="_blank"
                className="cursor-pointer"
              >
                <YoutubeFilled className="h-6 w-6 cursor-pointer" />
              </a>
              <a
                href="https://x.com/BPL_PoE"
                target="_blank"
                className="cursor-pointer"
              >
                <TwitterFilled className="h-6 w-6 cursor-pointer" />
              </a>
            </nav>
          </footer>
          {/* <div className="bg-base-200 p-4 text-center mt-20">
            This product isn't affiliated with or endorsed by Grinding Gear
            Games in any way.
          </div> */}
        </div>
      </ContextProvider>
    </>
  );

  return;
}

export default App;
