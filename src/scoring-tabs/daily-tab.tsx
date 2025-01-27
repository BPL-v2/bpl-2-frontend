import { Divider } from "antd";
import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { getSubCategory } from "../types/scoring-category";
import TeamScore from "../components/team-score";
import { DailyCard } from "../components/daily-card";
import { Daily } from "../types/scoring-objective";

function sortByReleasDate(dailyA: Daily, dailyB: Daily) {
  const a = dailyA.baseObjective;
  const b = dailyB.baseObjective!;
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
  const dailies: Record<string, Daily> = {};
  for (const objective of category.objectives) {
    if (!dailies[objective.name]) {
      dailies[objective.name] = {
        baseObjective: objective,
        raceObjective: undefined,
      };
    }
    if (objective.valid_to) {
      dailies[objective.name].raceObjective = objective;
    } else {
      dailies[objective.name].baseObjective = objective;
    }
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
        {Object.values(dailies)
          .sort(sortByReleasDate)
          .map((daily) => (
            <DailyCard daily={daily} />
          ))}
      </div>
    </>
  );
}
