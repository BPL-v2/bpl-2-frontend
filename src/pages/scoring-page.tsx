import UniqueTab from "../scoring-tabs/unique-tab";
import { useContext, useEffect, useState } from "react";
import { SubmissionTab } from "../scoring-tabs/submission-tab";
import { CollectionTab } from "../scoring-tabs/collection-tab";
import { LadderTab } from "../scoring-tabs/ladder-tab";
import { GlobalStateContext } from "../utils/context-provider";
import { useSearchParams } from "react-router-dom";
import { DailyTab } from "../scoring-tabs/daily-tab";
import { HeistTab } from "../scoring-tabs/heist-tab";
import { GemTab } from "../scoring-tabs/gem-tab";
import { getRootCategoryNames } from "../types/scoring-category";
export const scoringTabs: { key: string; tab: JSX.Element }[] = [
  {
    key: "Ladder",
    tab: <LadderTab />,
  },
  {
    key: "Uniques",
    tab: <UniqueTab />,
  },
  {
    key: "Races",
    tab: <SubmissionTab categoryName="Races" />,
  },
  {
    key: "Bounties",
    tab: <SubmissionTab categoryName="Bounties" />,
  },
  {
    key: "Collections",
    tab: <CollectionTab />,
  },
  {
    key: "Dailies",
    tab: <DailyTab />,
  },
  {
    key: "Heist",
    tab: <HeistTab />,
  },
  {
    key: "Gems",
    tab: <GemTab />,
  },
];

type ScoringPageProps = { tab?: string };

const ScoringPage = ({ tab }: ScoringPageProps) => {
  const { currentEvent } = useContext(GlobalStateContext);
  const [searchParams] = useSearchParams();
  const [selectedTab, setSelectedTab] = useState<string>(tab || "Ladder");
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setSelectedTab(tab);
    }
  }, [searchParams]);

  if (!currentEvent) {
    return <div>Event not found</div>;
  }

  const tabNames = [
    "Ladder",
    ...getRootCategoryNames(currentEvent.game_version),
  ];
  return (
    <>
      <ul
        className={`menu menu-horizontal bg-base-200 gap-0 md:gap-2 mb-4 w-full`}
      >
        {scoringTabs
          .filter((tab) => tabNames.includes(tab.key))
          .map((tab) => (
            <li key={tab.key}>
              <a
                href={`/scores?tab=${tab.key}`}
                className={`px-2 md:px-4 ${
                  selectedTab === tab.key
                    ? "bg-primary text-primary-content"
                    : ""
                }`}
                onClick={(e) => {
                  // allow opening in new tab
                  if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                    e.preventDefault();
                    setSelectedTab(tab.key);
                  }
                }}
              >
                {tab.key}
              </a>
            </li>
          ))}
      </ul>
      {scoringTabs.find((tab) => tab.key === selectedTab)?.tab}
    </>
  );
};

export default ScoringPage;
