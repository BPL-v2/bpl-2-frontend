import { Divider } from "antd";
import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { getSubCategory } from "../types/scoring-category";
import TeamScore from "../components/team-score";
import { DailyCard } from "../components/daily-card";
import { ScoreObjective } from "../types/score";

function sortByReleasDate(a: ScoreObjective, b: ScoreObjective) {
  const releaseA = a.valid_from ? new Date(a.valid_from) : new Date();
  const releaseB = b.valid_from ? new Date(b.valid_from) : new Date();
  return releaseA.getTime() - releaseB.getTime();
}

export function DailyTab() {
  const { scores, currentEvent } = useContext(GlobalStateContext);
  const category = getSubCategory(scores, "Dailies");

  if (!category || !currentEvent) {
    return <></>;
  }
  return (
    <>
      <TeamScore category={category}></TeamScore>
      <Divider>{`Dailies`}</Divider>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "8px",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        {category.objectives.sort(sortByReleasDate).map((objective) => (
          <DailyCard objective={objective} />
        ))}
      </div>
    </>
  );
}
