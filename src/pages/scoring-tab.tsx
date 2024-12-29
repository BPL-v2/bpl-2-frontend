import { Segmented } from "antd";
import UniquePage from "./uniques";
import { useEffect, useState } from "react";

const tabs: { [tab: string]: JSX.Element } = {
  "For You": <> For You</>,
  Uniques: <UniquePage />,
  Races: <> Races</>,
  Bounties: <>Bounties</>,
};

const ScoringTab = () => {
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
      <Segmented<string>
        options={Object.keys(tabs)}
        value={selectedTab}
        onChange={handleTabChange}
      />
      {tabs[selectedTab]}
    </>
  );
};

export default ScoringTab;
