import { GameVersion } from "@client/api";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { BountyTabRules } from "@rules/bounties";
import { CollectionTabRules } from "@rules/collections";
import { DailyTabRules } from "@rules/dailies";
import { DelveTabRules } from "@rules/delve";
import { GemTabRules } from "@rules/gems";
import { HeistTabRules } from "@rules/heist";
import { RaceTabRules } from "@rules/races";
import { UniqueTabRules } from "@rules/uniques";
import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { GlobalStateContext } from "@utils/context-provider";
import { usePageSEO } from "@utils/use-seo";
import { JSX, useContext, useEffect, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { router } from "../../main";

type scoringTabKey =
  | "ladder"
  | "for-you"
  | "progress"
  | "uniques"
  | "races"
  | "bounties"
  | "collections"
  | "dailies"
  | "heist"
  | "gems"
  | "delve";

export type ScoreQueryParams = {
  rules: boolean;
};

export const Route = createFileRoute("/scores")({
  component: ScoringPage,
  validateSearch: (search: Record<string, boolean>): ScoreQueryParams => {
    return {
      rules: search.rules,
    };
  },
});

function ScoringPage() {
  usePageSEO("scores");
  const { currentEvent } = useContext(GlobalStateContext);
  const { rules } = Route.useSearch();

  const selected = useRouterState({
    select: (state) => state.location.pathname.split("/").slice(-1)[0],
  });
  useEffect(() => {
    if (selected === "scores") {
      router.navigate({
        to: "/scores/ladder",
        search: {
          rules: rules,
        },
      });
    }
  }, [rules, selected]);

  const scoringTabs: {
    key: scoringTabKey;
    name: string;
    visible: boolean;
    rules?: JSX.Element;
  }[] = useMemo(() => {
    return [
      {
        name: "Ladder",
        key: "ladder",
        visible: true,
      },
      {
        name: "For You",
        key: "for-you",
        visible: true,
      },
      {
        name: "Progress",
        key: "progress",
        visible: true,
      },
      {
        name: "Uniques",
        key: "uniques",
        rules: <UniqueTabRules />,
        visible: true,
      },
      {
        name: "Races",
        key: "races",
        rules: <RaceTabRules />,
        visible: true,
      },
      {
        name: "Bounties",
        key: "bounties",
        rules: <BountyTabRules />,
        visible: true,
      },
      {
        name: "Collections",
        key: "collections",
        rules: <CollectionTabRules />,
        visible: true,
      },
      {
        name: "Dailies",
        key: "dailies",
        rules: <DailyTabRules />,
        visible: true,
      },
      {
        name: "Heist",
        key: "heist",
        rules: <HeistTabRules />,
        visible: currentEvent.game_version === GameVersion.poe1,
      },
      {
        name: "Gems",
        key: "gems",
        rules: <GemTabRules />,
        visible: currentEvent.game_version === GameVersion.poe1,
      },
      {
        name: "Delve",
        key: "delve",
        rules: <DelveTabRules />,
        visible: currentEvent.game_version === GameVersion.poe1,
      },
    ];
  }, [currentEvent]);

  return (
    <>
      <div className="flex items-center justify-between bg-base-200 mb-4 rounded-b-box">
        <ul className="menu menu-horizontal md:gap-2">
          {scoringTabs
            .filter((tab) => tab.visible)
            .map((tab) => (
              <li key={tab.key}>
                <Link
                  to={`/scores/${tab.key}`}
                  search={{ rules: rules }}
                  className={"btn btn-xs md:btn-sm text-base"}
                  activeProps={{
                    className: "btn-primary",
                  }}
                  inactiveProps={{
                    className: "btn-ghost hover:btn-primary",
                  }}
                >
                  {tab.name}
                </Link>
              </li>
            ))}
        </ul>
        <Link
          to={"/scores/" + selected}
          className={twMerge(
            "btn w-14 md:w-36 border-1 border-secondary mx-2 justify-between",
            rules ? "bg-secondary text-secondary-content" : "text-secondary"
          )}
          search={{ rules: !rules }}
        >
          <BookOpenIcon className="h-6 w-6" />
          <span className="hidden md:block">
            {rules ? "Hide" : "Show"} Rules
          </span>
        </Link>
      </div>
      <Outlet />
    </>
  );
}

export default ScoringPage;
