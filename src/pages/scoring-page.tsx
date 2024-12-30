import { Menu } from "antd";
import UniqueTab from "./unique-tab";
import { useEffect, useState } from "react";
import { SubmissionTab } from "../components/submission-tab";

const tabs: { [tab: string]: JSX.Element } = {
  "For You": <> For You</>,
  Uniques: <UniqueTab />,
  Races: <SubmissionTab categoryName="Races" />,
  Bounties: <SubmissionTab categoryName="Bounties" />,
};

const ScoringPage = () => {
  const [selectedTab, setSelectedTab] = useState<string>("For You");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("tab");
    if (tab && tabs[tab]) {
      setSelectedTab(tab);
    }
  }, []);

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    window.history.pushState({}, "", `/scores?tab=${value}`);
  };

  return (
    <>
      <Menu
        onClick={(info) => handleTabChange(info.key)}
        style={{ marginBottom: 20, marginTop: 5 }}
        mode="horizontal"
        items={Object.keys(tabs).map((tab) => ({
          key: tab,
          title: tab,
          label: tab,
        }))}
      />
      {tabs[selectedTab]}
    </>
  );
};

export default ScoringPage;
