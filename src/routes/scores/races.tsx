import { createFileRoute } from "@tanstack/react-router";
import SubmissionTab from "@components/submission-tab";
import { RaceTabRules } from "@rules/races";
import { JSX } from "react";

export const Route = createFileRoute("/scores/races")({
  component: RacePage,
});

export function RacePage(): JSX.Element {
  const { rules } = Route.useSearch();
  return (
    <>
      {rules ? (
        <div className="w-full bg-base-200  my-4  p-8 rounded-box">
          <article className="prose text-left max-w-4xl">
            <RaceTabRules />
          </article>
        </div>
      ) : null}
      <SubmissionTab categoryName="Races" />{" "}
    </>
  );
}
