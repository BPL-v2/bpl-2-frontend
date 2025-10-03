import { createFileRoute } from "@tanstack/react-router";
import SubmissionTab from "@components/submission-tab";
import { BountyTabRules } from "@rules/bounties";
import { JSX } from "react";

export const Route = createFileRoute("/scores/bounties")({
  component: BountiesPage,
});

function BountiesPage(): JSX.Element {
  const { rules } = Route.useSearch();
  return (
    <>
      {rules ? (
        <div className="my-4 w-full rounded-box bborder bg-base-200 p-8">
          <article className="prose max-w-4xl text-left">
            <BountyTabRules />
          </article>
        </div>
      ) : null}
      <SubmissionTab categoryName="Bounties" />
    </>
  );
}
