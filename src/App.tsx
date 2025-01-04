import { Layout, Menu, MenuProps } from "antd";
import "./App.css";
import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { Content, Header } from "antd/es/layout/layout";
import AuthButton from "./components/auth-button";
import { ContextProvider } from "./utils/context-provider";
import { MinimalUser, User, UserPermission } from "./types/user";
import { fetchUsersForEvent, getUserInfo } from "./client/user-client";
import { router } from "./router";
import {
  fetchCurrentEvent,
  getEventStatus as fetchEventStatus,
} from "./client/event-client";
import { BPLEvent, EventStatus } from "./types/event";
import { useError } from "./components/errorcontext";
import {
  RiseOutlined,
  SettingOutlined,
  TwitchOutlined,
} from "@ant-design/icons";
import { ScoringCategory } from "./types/scoring-category";
import { fetchCategoryForEvent } from "./client/category-client";
import { fetchScores } from "./client/score-client";
import { ScoreCategory } from "./types/score";
import { mergeScores } from "./utils/utils";
import { fetchScoringPresetsForEvent } from "./client/scoring-preset-client";
import { ScoringPreset } from "./types/scoring-preset";
type MenuItem = Required<MenuProps>["items"][number] & {
  rolerequired?: UserPermission[];
};

const items: MenuItem[] = [
  {
    label: "Admin",
    key: "Admin",
    icon: <SettingOutlined />,
    extra: "right",
    rolerequired: [UserPermission.ADMIN],
    children: [
      {
        label: "Events",
        key: "/events",
      },
      {
        type: "group",
        label: "Users",
        children: [
          { label: "Manage users", key: "/users" },
          { label: "Sort users", key: "setting:2" },
        ],
      },
    ],
  },
  {
    label: "Scoring",
    key: "/scores",
    icon: <RiseOutlined />,
  },
  {
    label: "Streams",
    key: "/streams",
    icon: <TwitchOutlined />,
  },
];

function filterMenuItems(items: MenuItem[], user: User | undefined) {
  let userRoles = user?.permissions;
  let authItems = [];
  for (let item of items) {
    if (item.rolerequired) {
      if (
        userRoles &&
        item.rolerequired.some((role) => userRoles.includes(role))
      ) {
        authItems.push(item);
      }
    } else {
      authItems.push(item);
    }
  }
  return authItems;
}

function App() {
  const [currentNav, setCurrentNav] = useState("events");
  const [user, setUser] = useState<User>();
  const [menuItems, setMenuItems] = useState<MenuItem[]>(items);
  const [currentEvent, setCurrentEvent] = useState<BPLEvent>();
  const [eventStatus, setEventStatus] = useState<EventStatus>();
  const [rules, setRules] = useState<ScoringCategory>();
  const { scoreData } = fetchScores();
  const [scores, setScores] = useState<ScoreCategory>();
  const [scoringPresets, setScoringPresets] = useState<ScoringPreset[]>();
  const [users, setUsers] = useState<MinimalUser[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    getUserInfo().then((data) => setUser(data));
  }, []);
  useEffect(() => {
    setMenuItems(filterMenuItems(items, user));
  }, [user]);

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
    fetchCurrentEvent().then((event) => {
      setCurrentEvent(event);
      fetchCategoryForEvent(event.id).then((rules) => setRules(rules));
      fetchEventStatus(event.id).then((status) => setEventStatus(status));
      fetchScoringPresetsForEvent(event.id).then((presets) =>
        setScoringPresets(presets)
      );
      fetchUsersForEvent(event.id).then((users) => setUsers(users));
    });
  }, []);
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

  return (
    <>
      <ContextProvider
        value={{
          user: user,
          setUser: setUser,
          currentEvent: currentEvent,
          setCurrentEvent: setCurrentEvent,
          rules: rules,
          setRules: setRules,
          eventStatus: eventStatus,
          setEventStatus: () => {},
          scores: scores,
          setScores: () => {},
          users: users,
          setUsers: setUsers,
          isMobile: isMobile,
          setIsMobile: setIsMobile,
        }}
      >
        {" "}
        <Layout>
          <Header
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#4096ff",
              padding: "0",
            }}
          >
            <Menu
              style={{ flex: 1 }}
              onClick={(e) => {
                setCurrentNav(e.key);
                router.navigate(e.key);
              }}
              selectedKeys={[currentNav]}
              mode="horizontal"
              items={menuItems}
            />
            <AuthButton style={{ height: "100%" }} />
          </Header>
          <Content style={{ height: "80vh" }}>
            <RouterProvider router={router} />
          </Content>

          {/* <Footer style={{ height: "10vh" }}></Footer> */}
        </Layout>
      </ContextProvider>
    </>
  );

  return;
}

export default App;
