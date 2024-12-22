import { createBrowserRouter } from "react-router-dom";
import EventPage from "./pages/event";
import TeamPage from "./pages/teams";
import ScoringCategoryPage from "./pages/scoring-categories";
import ConditionPage from "./pages/conditions";
import ScoringPresetsPage from "./pages/scoring-presets";
import UserPage from "./pages/users";

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
    path: "/scoring-presets/:eventId",
    element: <ScoringPresetsPage />,
  },
  {
    path: "/objectives/:objectiveId/conditions",
    element: <ConditionPage />,
  },
  {
    path: "/users",
    element: <UserPage />,
  },
]);
