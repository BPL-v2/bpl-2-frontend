import { createBrowserRouter } from "react-router-dom";
import EventPage from "./pages/event";
import TeamPage from "./pages/teams";
import ScoringCategoryPage from "./pages/scoring-categories";
import ConditionPage from "./pages/conditions";
import ScoringPresetsPage from "./pages/scoring-presets";
import UserPage from "./pages/users";
import SubmissionPage from "./pages/bounty-submissions";
import ScoringPage from "./pages/scoring-page";
import { TwitchPage } from "./pages/twitch-page";
import { RulePage } from "./pages/rules";
import { ProfilePage } from "./pages/profile";

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
  {
    path: "/submissions",
    element: <SubmissionPage />,
  },
  {
    path: "/scores",
    element: <ScoringPage />,
  },
  {
    path: "/streams",
    element: <TwitchPage />,
  },
  {
    path: "/rules",
    element: <RulePage />,
  },
  {
    path: "/profile",
    element: <ProfilePage />,
  },
]);
