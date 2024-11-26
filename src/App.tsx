import { ConfigProvider, Layout, Menu, MenuProps, theme } from "antd";
import "./App.css";
import EventPage from "./pages/event";
import TeamPage from "./pages/teams";
import { useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Footer, Header } from "antd/es/layout/layout";
import ScoringCategoryPage from "./pages/scoring-categories";

const items = [
  {
    label: "Events",
    key: "events",
    path: "/events",
  },
  {
    label: "Teams",
    key: "teams",
    path: "/teams",
  },
];

export const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Hello World</div>,
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
]);

function App() {
  const [current, setCurrent] = useState("events");
  return (
    <>
      {" "}
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
        }}
      >
        {" "}
        <div className="fixed top-0 left-0 w-full z-50">
          <Header>
            <Menu
              onClick={(e) => {
                setCurrent(e.key);
                router.navigate(
                  items
                    .filter((route) => route.key === e.key)
                    .map((route) => route.path)[0]
                );
              }}
              selectedKeys={[current]}
              mode="horizontal"
              items={items}
            />
          </Header>
        </div>
        <RouterProvider router={router} />
        <Footer></Footer>
      </ConfigProvider>
    </>
  );

  return;
}

export default App;
