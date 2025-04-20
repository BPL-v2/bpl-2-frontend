import { createFileRoute } from "@tanstack/react-router";
import SubmissionTab from "@components/submission-tab";

export const Route = createFileRoute("/scores/races")({
  component: RouteComponent,
});

function RouteComponent() {
  return <SubmissionTab categoryName="Races" />;
}
