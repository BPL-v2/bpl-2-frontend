import { JSX, useContext, useEffect, useMemo, useState } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import { GameVersion } from "@client/api";
import { UniqueTabRules } from "@rules/uniques";
import { RaceTabRules } from "@rules/races";
import { BountyTabRules } from "@rules/bounties";
import { CollectionTabRules } from "@rules/collections";
import { DailyTabRules } from "@rules/dailies";
import { HeistTabRules } from "@rules/heist";
import { GemTabRules } from "@rules/gems";
import BookOpenIcon from "@heroicons/react/24/outline/BookOpenIcon";
import { DelveTabRules } from "@rules/delve";
import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { router } from "../../router";

type scoringTabKey =
  | "ladder"
  | "for-you"
  | "uniques"
  | "races"
  | "bounties"
  | "collections"
  | "dailies"
  | "heist"
  | "gems"
  | "delve";

export const Route = createFileRoute("/scores")({
  component: ScoringPage,
});

function ScoringPage() {
  const { currentEvent, gameVersion, eventStatus } =
    useContext(GlobalStateContext);

  const [showRules, setShowRules] = useState<boolean>(false);
  const selected = useRouterState({
    select: (state) => state.location.pathname.split("/").slice(-1)[0],
  });
  useEffect(() => {
    if (selected === "scores") {
      router.navigate({
        to: `/scores/ladder`,
      });
    }
  }, [selected]);

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
        visible: !!eventStatus?.team_id,
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
        visible: gameVersion === GameVersion.poe1,
      },
      {
        name: "Gems",
        key: "gems",
        rules: <GemTabRules />,
        visible: gameVersion === GameVersion.poe1,
      },
      {
        name: "Delve",
        key: "delve",
        rules: <DelveTabRules />,
        visible: gameVersion === GameVersion.poe1,
      },
    ];
  }, [gameVersion, eventStatus]);

  if (!currentEvent) {
    return <div>Event not found</div>;
  }
  const tab = scoringTabs.find((tab) => tab.key === selected);
  return (
    <>
      <div className="flex items-center justify-between bg-base-200 mb-4 rounded-b-box">
        <ul className="menu menu-horizontal gap-1 md:gap-2">
          {scoringTabs
            .filter((tab) => tab.visible)
            .map((tab) => (
              <li key={tab.key}>
                <Link
                  to={`/scores/${tab.key}`}
                  className={`btn`}
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
        <button
          className={`btn w-14 md:w-36 border-1 border-secondary ${
            showRules ? "bg-secondary text-secondary-content" : "text-secondary"
          }`}
          onClick={() => {
            setShowRules(!showRules);
          }}
        >
          <BookOpenIcon className="h-6 w-6" />
          <span className="hidden md:block">
            {showRules ? "Hide" : "Show"} Rules
          </span>
        </button>
      </div>

      {showRules && tab?.rules !== undefined ? (
        <article className="prose text-left max-w-4xl my-4 bg-base-200 p-8 rounded-box">
          {tab.rules || null}
        </article>
      ) : null}
      <Outlet />
    </>
  );
}

export default ScoringPage;
