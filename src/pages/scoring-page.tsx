import UniqueTab from "../scoring-tabs/uniques";
import { JSX, useContext, useEffect, useMemo, useState } from "react";
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
import { ForYouTab } from "../scoring-tabs/for-you";
type ScoringPageProps = { tabKey?: string };

const ScoringPage = ({ tabKey }: ScoringPageProps) => {
  const { currentEvent, gameVersion, eventStatus } =
    useContext(GlobalStateContext);
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

  const scoringTabs: {
    key: string;
    tab: JSX.Element;
    visible: boolean;
    rules?: JSX.Element;
  }[] = useMemo(() => {
    return [
      {
        key: "Ladder",
        tab: <LadderTab />,
        visible: true,
      },
      {
        key: "For You",
        tab: <ForYouTab />,
        visible: !!eventStatus?.team_id,
      },
      {
        key: "Uniques",
        tab: <UniqueTab />,
        rules: <UniqueTabRules />,
        visible: true,
      },
      {
        key: "Races",
        tab: <SubmissionTab categoryName="Races" />,
        rules: <RaceTabRules />,
        visible: true,
      },
      {
        key: "Bounties",
        tab: <SubmissionTab categoryName="Bounties" />,
        rules: <BountyTabRules />,
        visible: true,
      },
      {
        key: "Collections",
        tab: <CollectionTab />,
        rules: <CollectionTabRules />,
        visible: true,
      },
      {
        key: "Dailies",
        tab: <DailyTab />,
        rules: <DailyTabRules />,
        visible: true,
      },
      {
        key: "Heist",
        tab: <HeistTab />,
        rules: <HeistTabRules />,
        visible: gameVersion === GameVersion.poe1,
      },
      {
        key: "Gems",
        tab: <GemTab />,
        rules: <GemTabRules />,
        visible: gameVersion === GameVersion.poe1,
      },
      {
        key: "Delve",
        tab: <DelveTab />,
        rules: <DelveTabRules />,
        visible: gameVersion === GameVersion.poe1,
      },
    ];
  }, [gameVersion, eventStatus]);

  if (!currentEvent) {
    return <div>Event not found</div>;
  }
  const tab = scoringTabs.find((tab) => tab.key === selectedTabKey);
  return (
    <>
      <div className="flex items-center justify-between bg-base-200 mb-4 rounded-b-box">
        <ul className="menu menu-horizontal gap-0 md:gap-2">
          {scoringTabs
            .filter((tab) => tab.visible)
            .map((tab) => (
              <li key={tab.key}>
                <a
                  href={`/scores?tab=${tab.key}`}
                  className={`px-2 md:px-4 hover:bg-primary hover:text-primary-content ${
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
          className={`btn btn-secondary w-36 ${showRules ? "" : "btn-outline"}`}
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
