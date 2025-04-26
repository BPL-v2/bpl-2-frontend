import { createFileRoute } from "@tanstack/react-router";
import SubmissionTab from "@components/submission-tab";
import { RaceTabRules } from "@rules/races";
import { ruleWrapper } from "./route";

export const Route = createFileRoute("/scores/races")({
  component: () =>
    ruleWrapper(<SubmissionTab categoryName="Races" />, <RaceTabRules />),
});
