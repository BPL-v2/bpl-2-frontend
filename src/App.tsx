import { Layout, Menu } from "antd";
import "./App.css";
import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { Content, Footer, Header } from "antd/es/layout/layout";
import AuthButton from "./components/auth";
import { ContextProvider } from "./utils/context-provider";
import { User } from "./types/user";
import { getUserInfo } from "./client/user-client";
import { router } from "./router";
import { fetchCurrentEvent } from "./client/event-client";
import { BPLEvent } from "./types/event";
import { useError } from "./components/errorcontext";

const items = [
  {
    label: "Events",
    key: "events",
    path: "/events",
  },
];

function App() {
  const [currentNav, setCurrentNav] = useState("events");
  const [user, setUser] = useState<User>();
  const [currentEvent, setCurrentEvent] = useState<BPLEvent>();
  useEffect(() => {
    getUserInfo().then((data) => setUser(data));
  }, [setUser]);

  useEffect(() => {
    fetchCurrentEvent().then((data) => {
      setCurrentEvent(data);
    });
  }, [setCurrentEvent]);
  const sendNotification = useError().sendNotification;

  useEffect(() => {
    window.addEventListener("error", handleError);
  }, []);
  const handleError = (a: ErrorEvent) => {
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
        }}
      >
        {" "}
        <Layout>
          <Header style={{ display: "flex", alignItems: "center" }}>
            <Menu
              style={{ flex: 1, minWidth: "80%" }}
              onClick={(e) => {
                setCurrentNav(e.key);
                router.navigate(
                  items
                    .filter((route) => route.key === e.key)
                    .map((route) => route.path)[0]
                );
              }}
              selectedKeys={[currentNav]}
              mode="horizontal"
              items={items}
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
