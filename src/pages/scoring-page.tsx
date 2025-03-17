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
export const scoringTabs: {
  key: string;
  tab: JSX.Element;
  gameVersions: GameVersion[];
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
  },
  {
    key: "Races",
    tab: <SubmissionTab categoryName="Races" />,
    gameVersions: [GameVersion.poe1, GameVersion.poe2],
  },
  {
    key: "Bounties",
    tab: <SubmissionTab categoryName="Bounties" />,
    gameVersions: [GameVersion.poe1, GameVersion.poe2],
  },
  {
    key: "Collections",
    tab: <CollectionTab />,
    gameVersions: [GameVersion.poe1, GameVersion.poe2],
  },
  {
    key: "Dailies",
    tab: <DailyTab />,
    gameVersions: [GameVersion.poe1, GameVersion.poe2],
  },
  {
    key: "Heist",
    tab: <HeistTab />,
    gameVersions: [GameVersion.poe1],
  },
  {
    key: "Gems",
    tab: <GemTab />,
    gameVersions: [GameVersion.poe1],
  },
  {
    key: "Delve",
    tab: <DelveTab />,
    gameVersions: [GameVersion.poe1],
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

  return (
    <>
      <ul
        className={`menu menu-horizontal bg-base-200 gap-0 md:gap-2 mb-4 w-full`}
      >
        {scoringTabs
          .filter((tab) => tab.gameVersions.includes(currentEvent.game_version))
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
      {scoringTabs.find((tab) => tab.key === selectedTab)?.tab}
    </>
  );
};

export default ScoringPage;
