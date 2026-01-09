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
import { useGetRules } from "@client/query";
import { AscendancyChallengeTabRules } from "../../rules-alt/ascendancy-challenges";
import { GraftRaceTabRules } from "../../rules-alt/graft-race";

type scoringTabKey =
  | "ladder"
  | "for-you"
  | "progress"
  | "uniques"
  | "focus-uniques"
  | "slot-uniques"
  | "foulborn-uniques"
  | "graft-race"
  | "races"
  | "bounties"
  | "ascendancy-challenges"
  | "collections"
  | "dailies"
  | "heist"
  | "gems"
  | "scarabs"
  | "delve"
  | "bingo";

type ScoreQueryParams = {
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
  const { rules: categories } = useGetRules(currentEvent.id);
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
        replace: true,
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
        name: "Focus Uniques",
        key: "focus-uniques",
        rules: <UniqueTabRules />,
        visible: true,
      },
      {
        name: "Slot Uniques",
        key: "slot-uniques",
        rules: <UniqueTabRules />,
        visible: true,
      },
      {
        name: "Foulborn Uniques",
        key: "foulborn-uniques",
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
        name: "Ascendancy Challenges",
        key: "ascendancy-challenges",
        rules: <AscendancyChallengeTabRules />,
        visible: true,
      },
      {
        name: "Graft Race",
        key: "graft-race",
        rules: <GraftRaceTabRules />,
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
        name: "Scarabs",
        key: "scarabs",
        rules: <GemTabRules />,
        visible: currentEvent.game_version === GameVersion.poe1,
      },
      {
        name: "Delve",
        key: "delve",
        rules: <DelveTabRules />,
        visible: currentEvent.game_version === GameVersion.poe1,
      },
      {
        name: "Bingo",
        key: "bingo",
        rules: <></>,
        visible: true,
      },
    ];
  }, [currentEvent]);
  const tabs: {
    key: scoringTabKey;
    name: string;
    visible: boolean;
    rules?: JSX.Element;
  }[] = [
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
    ...scoringTabs.filter(
      (tab) =>
        tab.visible && categories?.children.find((c) => c.name === tab.name),
    ),
  ];
  return (
    <>
      <div className="mb-4 flex items-center justify-between rounded-b-box bg-base-300 shadow-xl">
        <ul className="menu menu-horizontal md:gap-2">
          {tabs.map((tab) => (
            <li key={tab.key}>
              <Link
                to={`/scores/${tab.key}`}
                search={{ rules: rules }}
                className={"btn text-base btn-xs md:btn-sm"}
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
            "btn mx-2 w-14 justify-between border border-secondary md:w-36",
            rules ? "bg-secondary text-secondary-content" : "text-secondary",
          )}
          search={{ rules: !rules }}
        >
          <BookOpenIcon className="size-6" />
          <span className="hidden md:block">
            {rules ? "Hide" : "Show"} Rules
          </span>
        </Link>
      </div>
      <Outlet />
    </>
  );
}
