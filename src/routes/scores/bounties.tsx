import { createFileRoute } from "@tanstack/react-router";
import SubmissionTab from "@components/submission-tab";
import { BountyTabRules } from "@rules/bounties";
import { JSX } from "react";

export const Route = createFileRoute("/scores/bounties")({
  component: BountiesPage,
});

export function BountiesPage(): JSX.Element {
  const { rules } = Route.useSearch();
  return (
    <>
      {rules ? (
        <div className="w-full bg-base-200  my-4  p-8 rounded-box">
          <article className="prose text-left max-w-4xl">
            <BountyTabRules />
          </article>
        </div>
      ) : null}
      <SubmissionTab categoryName="Bounties" />
    </>
  );
}
