import { createFileRoute } from "@tanstack/react-router";
import SubmissionTab from "@components/submission-tab";
import { ruleWrapper } from "./route";
import { BountyTabRules } from "@rules/bounties";

export const Route = createFileRoute("/scores/bounties")({
  component: () =>
    ruleWrapper(<SubmissionTab categoryName="Bounties" />, <BountyTabRules />),
});
