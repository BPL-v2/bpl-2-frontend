import { ConfigProvider, Layout, Menu, theme } from "antd";
import "./App.css";
import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { Content, Footer, Header } from "antd/es/layout/layout";
import AuthButton from "./components/auth";
import { ContextProvider } from "./utils/context-provider";
import { User } from "./types/user";
import { getUserInfo } from "./client/user-client";
import { router } from "./router";

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
  useEffect(() => {
    getUserInfo().then((data) => setUser(data));
  }, [setUser]);

  return (
    <>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
        }}
      >
        <ContextProvider
          value={{
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
