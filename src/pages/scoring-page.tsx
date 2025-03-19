import UniqueTab from "../scoring-tabs/uniques";
import { JSX, useContext, useEffect, useState } from "react";
import { SubmissionTab } from "../scoring-tabs/submissions";
import { CollectionTab } from "../scoring-tabs/collections";
import { LadderTab } from "../scoring-tabs/ladder";
import { GlobalStateContext } from "../utils/context-provider";
import { useSearchParams } from "react-router-dom";
import { DailyTab } from "../scoring-tabs/dailies";
import { HeistTab } from "../scoring-tabs/heist";
import { GemTab } from "../scoring-tabs/gems";
import { router } from "../router";
import { DelveTab } from "../scoring-tabs/delve";
import { GameVersion } from "../client";
import { UniqueTabRules } from "../rules/uniques";
import { RaceTabRules } from "../rules/races";
import { BountyTabRules } from "../rules/bounties";
import { CollectionTabRules } from "../rules/collections";
import { DailyTabRules } from "../rules/dailies";
import { HeistTabRules } from "../rules/heist";
import { GemTabRules } from "../rules/gems";
import BookOpenIcon from "@heroicons/react/24/outline/BookOpenIcon";
import { DelveTabRules } from "../rules/delve";
export const scoringTabs: {
  key: string;
  tab: JSX.Element;
  gameVersions: GameVersion[];
  rules?: JSX.Element;
}[] = [
  {
    key: "Ladder",
    tab: <LadderTab />,
    gameVersions: [GameVersion.poe1, GameVersion.poe2],
  },
  {
    key: "Uniques",
    tab: <UniqueTab />,
    gameVersions: [GameVersion.poe1, GameVersion.poe2],
    rules: <UniqueTabRules />,
  },
  {
    key: "Races",
    tab: <SubmissionTab categoryName="Races" />,
    gameVersions: [GameVersion.poe1, GameVersion.poe2],
    rules: <RaceTabRules />,
  },
  {
    key: "Bounties",
    tab: <SubmissionTab categoryName="Bounties" />,
    gameVersions: [GameVersion.poe1, GameVersion.poe2],
    rules: <BountyTabRules />,
  },
  {
    key: "Collections",
    tab: <CollectionTab />,
    gameVersions: [GameVersion.poe1, GameVersion.poe2],
    rules: <CollectionTabRules />,
  },
  {
    key: "Dailies",
    tab: <DailyTab />,
    gameVersions: [GameVersion.poe1, GameVersion.poe2],
    rules: <DailyTabRules />,
  },
  {
    key: "Heist",
    tab: <HeistTab />,
    gameVersions: [GameVersion.poe1],
    rules: <HeistTabRules />,
  },
  {
    key: "Gems",
    tab: <GemTab />,
    gameVersions: [GameVersion.poe1],
    rules: <GemTabRules />,
  },
  {
    key: "Delve",
    tab: <DelveTab />,
    gameVersions: [GameVersion.poe1],
    rules: <DelveTabRules />,
  },
];

type ScoringPageProps = { tabKey?: string };

const ScoringPage = ({ tabKey }: ScoringPageProps) => {
  const { currentEvent } = useContext(GlobalStateContext);
  const [searchParams] = useSearchParams();
  const [selectedTabKey, setSelectedTabKey] = useState<string>(
    tabKey || "Ladder"
  );
  const [showRules, setShowRules] = useState<boolean>(false);
  useEffect(() => {
    const tabKey = searchParams.get("tab");
    if (tabKey) {
      setSelectedTabKey(tabKey);
    }
  }, [searchParams]);

  if (!currentEvent) {
    return <div>Event not found</div>;
  }
  const tab = scoringTabs.find((tab) => tab.key === selectedTabKey);
  return (
    <>
      <div className="flex items-center justify-between bg-base-200 mb-4 w-full">
        <ul className="menu menu-horizontal gap-0 md:gap-2">
          {scoringTabs
            .filter((tab) =>
              tab.gameVersions.includes(currentEvent.game_version)
            )
            .map((tab) => (
              <li key={tab.key}>
                <a
                  href={`/scores?tab=${tab.key}`}
                  className={`px-2 md:px-4 ${
                    selectedTabKey === tab.key
                      ? "bg-primary text-primary-content"
                      : ""
                  }`}
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                      e.preventDefault();
                      router.navigate(`/scores?tab=${tab.key}`);
                    }
                  }}
                >
                  {tab.key}
                </a>
              </li>
            ))}
        </ul>
        <button
          className={`btn btn-secondary ${showRules ? "" : "btn-outline"}`}
          onClick={() => {
            setShowRules(!showRules);
          }}
        >
          <BookOpenIcon className="h-6 w-6" />{" "}
          <span className="hidden md:block">
            {showRules ? "Hide" : "Show"} Rules
          </span>
        </button>
      </div>
      {showRules && tab?.rules ? (
        <article className="prose text-left max-w-4xl my-4 bg-base-200 p-8 rounded-box">
          {tab.rules}
        </article>
      ) : null}

      {tab?.tab}
    </>
  );
};

export default ScoringPage;
