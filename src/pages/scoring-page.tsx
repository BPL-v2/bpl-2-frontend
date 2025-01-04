import { Menu } from "antd";
import UniqueTab from "../scoring-tabs/unique-tab";
import { useEffect, useState } from "react";
import { SubmissionTab } from "../scoring-tabs/submission-tab";
import { CollectionTab } from "../scoring-tabs/collection-tab";
import { LadderTab } from "../scoring-tabs/ladder-tab";
import { RuleTab } from "../scoring-tabs/rule-tab";

const tabs: { [tab: string]: JSX.Element } = {
  Ladder: <LadderTab />,
  Uniques: <UniqueTab />,
  Races: <SubmissionTab categoryName="Races" />,
  Bounties: <SubmissionTab categoryName="Bounties" />,
  Collections: <CollectionTab />,
  Rules: <RuleTab />,
};

const ScoringPage = () => {
  const [selectedTab, setSelectedTab] = useState<string>("Uniques");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("tab");
    if (tab && tabs[tab]) {
      setSelectedTab(tab);
    }
  }, []);

  useEffect(() => {
    window.history.pushState({}, "", `/scores?tab=${selectedTab}`);
  }, [selectedTab]);

  return (
    <>
      <Menu
        onClick={(info) => setSelectedTab(info.key)}
        style={{ marginBottom: 20, marginTop: 5, userSelect: "none" }}
        mode="horizontal"
        items={Object.keys(tabs).map((tab) => ({
          key: tab,
          title: tab,
          label: tab,
        }))}
        selectedKeys={[selectedTab]}
      />
      {tabs[selectedTab]}
    </>
  );
};

export default ScoringPage;
