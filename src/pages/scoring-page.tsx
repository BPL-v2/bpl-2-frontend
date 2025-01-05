import { Menu } from "antd";
import UniqueTab from "../scoring-tabs/unique-tab";
import { useContext, useEffect, useState } from "react";
import { SubmissionTab } from "../scoring-tabs/submission-tab";
import { CollectionTab } from "../scoring-tabs/collection-tab";
import { LadderTab } from "../scoring-tabs/ladder-tab";
import { GlobalStateContext } from "../utils/context-provider";
import { useSearchParams } from "react-router-dom";

const tabs: { key: string; tab: JSX.Element }[] = [
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
];

type ScoringPageProps = { tab?: string };

const ScoringPage = ({ tab }: ScoringPageProps) => {
  const [searchParams] = useSearchParams();
  const { isMobile } = useContext(GlobalStateContext);
  const [selectedTab, setSelectedTab] = useState<string>(tab || "Ladder");
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setSelectedTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    window.history.pushState({}, "", `/scores?tab=${selectedTab}`);
  }, [selectedTab]);

  return (
    <>
      {isMobile ? null : (
        <Menu
          onClick={(info) => setSelectedTab(info.key)}
          style={{ marginBottom: 20, marginTop: 5, userSelect: "none" }}
          mode="horizontal"
          items={tabs.map((tab) => ({
            key: tab.key,
            title: tab.key,
            label: tab.key,
          }))}
          selectedKeys={[selectedTab]}
        />
      )}

      {tabs.find((tab) => tab.key === selectedTab)?.tab}
    </>
  );
};

export default ScoringPage;
