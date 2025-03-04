import { createBrowserRouter } from "react-router-dom";
import SubmissionPage from "./pages/bounty-submissions";
import ScoringPage from "./pages/scoring-page";
import { TwitchPage } from "./pages/twitch-page";
import { RulePage } from "./pages/rules";
import { ProfilePage } from "./pages/profile";
import UserSortPage from "./pages/user-sort";
import { ScoringReadmePage } from "./pages/scoring_readme";
import { MainPage } from "./pages/main";
import React from "react";
import RecurringJobsPage from "./pages/recurring-jobs";

// load admin pages lazily
const ScoringPresetsPage = React.lazy(() => import("./pages/scoring-presets"));
const ConditionPage = React.lazy(() => import("./pages/conditions"));
const ScoringCategoryPage = React.lazy(
  () => import("./pages/scoring-categories")
);
const EventPage = React.lazy(() => import("./pages/event"));
const TeamPage = React.lazy(() => import("./pages/teams"));
const UserPage = React.lazy(() => import("./pages/users"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage />,
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
    path: "/events/:eventId/scoring-categories/:categoryId",
    element: <ScoringCategoryPage />,
  },
  {
    path: "/events/:eventId/scoring-presets",
    element: <ScoringPresetsPage />,
  },
  {
    path: "/events/:eventId/objectives/:objectiveId/conditions",
    element: <ConditionPage />,
  },
  {
    path: "/users",
    element: <UserPage />,
  },
  {
    path: "/events/:eventId/users/sort",
    element: <UserSortPage />,
  },
  {
    path: "/events/:eventId/submissions",
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
  {
    path: "/scoring-readme",
    element: <ScoringReadmePage />,
  },
  {
    path: "/submissions",
    element: <SubmissionPage />,
  },
  {
    path: "/recurring-jobs",
    element: <RecurringJobsPage />,
  },
]);
