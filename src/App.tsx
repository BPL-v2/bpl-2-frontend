import { Layout, Menu, MenuProps } from "antd";
import "./App.css";
import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { Content, Footer, Header } from "antd/es/layout/layout";
import AuthButton from "./components/auth";
import { ContextProvider } from "./utils/context-provider";
import { User, UserPermission } from "./types/user";
import { getUserInfo } from "./client/user-client";
import { router } from "./router";
import { fetchCurrentEvent, getEventStatus } from "./client/event-client";
import { BPLEvent, EventStatus } from "./types/event";
import { useError } from "./components/errorcontext";
import { SettingOutlined } from "@ant-design/icons";
import { ScoringCategory } from "./types/scoring-category";
import { fetchCategoryForEvent } from "./client/category-client";
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
  useEffect(() => {
    getUserInfo().then((data) => setUser(data));
  }, []);
  useEffect(() => {
    setMenuItems(filterMenuItems(items, user));
  }, [user]);

  useEffect(() => {
    fetchCurrentEvent().then((data) => {
      setCurrentEvent(data);
      fetchCategoryForEvent(data.id).then((data) => setRules(data));
      getEventStatus(data.id).then((data) => setEventStatus(data));
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
        }}
      >
        {" "}
        <Layout>
          <Header style={{ display: "flex", alignItems: "center" }}>
            <Menu
              style={{ flex: 1, minWidth: "80%" }}
              onClick={(e) => {
                setCurrentNav(e.key);
                router.navigate(e.key);
              }}
              selectedKeys={[currentNav]}
              mode="horizontal"
              items={menuItems}
            />
            <AuthButton></AuthButton>
          </Header>
          <Content style={{ height: "80vh" }}>
            <RouterProvider router={router} />
          </Content>

          <Footer style={{ height: "10vh" }}></Footer>
        </Layout>
      </ContextProvider>
    </>
  );

  return;
}

export default App;
