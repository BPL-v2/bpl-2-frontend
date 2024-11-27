import { ConfigProvider, Layout, Menu, theme } from "antd";
import "./App.css";
import EventPage from "./pages/event";
import TeamPage from "./pages/teams";
import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Content, Footer, Header } from "antd/es/layout/layout";
import AuthButton from "./components/auth";
import { ContextProvider } from "./utils/context-provider";
import { jwtDecode } from "jwt-decode";
import { User } from "./types/user";
import ScoringCategoryPage from "./pages/scoring-categories";

const items = [
  {
    label: "Events",
    key: "events",
    path: "/events",
  },
];

export const router = createBrowserRouter([
  {
    path: "/",
    element: <></>,
  },
  {
    path: "/events",
    element: <EventPage />,
  },
  {
    path: "/events/:eventId/teams",
    element: <TeamPage />,
  },
  {
    path: "/scoring-categories/:categoryId",
    element: <ScoringCategoryPage />,
  },
  {
    path: "/landing-page",
    element: <div> Landing Page </div>,
  },
]);

function App() {
  const [currentNav, setCurrentNav] = useState("events");
  let token = "";
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token") || "";
  }
  const [jwtToken, setJwtToken] = useState(token);
  const [user, setUser] = useState<User>();

  useEffect(() => {
    if (jwtToken) {
      setUser(jwtDecode(jwtToken));
    }
  }, [jwtToken]);

  return (
    <>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
        }}
      >
        <ContextProvider
          value={{
            jwtToken: jwtToken,
            setJwtToken: setJwtToken,
            user: user,
            setUser: setUser,
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
      </ConfigProvider>
    </>
  );

  return;
}

export default App;
