import { JSX, useContext } from "react";
import { GlobalStateContext } from "@utils/context-provider";

function racePointsToText(points: number[]): JSX.Element[] {
  const textParts = points.map((point, index) => {
    if (index === 0) {
      return (
        <span key={index}>
          The first team to complete the race will be awarded{" "}
          <b className="text-info">{point}</b> points
        </span>
      );
    } else if (index === points.length - 1) {
      return (
        <span key={index}>
          {" "}
          and the remaining teams <b className="text-info">{point}</b> points
        </span>
      );
    } else {
      return (
        <span key={index}>
          {" "}
          the next team will get <b className="text-info">{point}</b> points
        </span>
      );
    }
  });
  return textParts;
}
export function DelveTabRules() {
  const { scores } = useContext(GlobalStateContext);

  const delveCategory = scores?.sub_categories.find(
    (category) => category.name === "Delve"
  );

  const fossilRaceCategory = delveCategory?.sub_categories.find(
    (c) => c.name === "Fossil Race"
  );

  const culmDepthObjective = delveCategory?.objectives.find(
    (c) => c.name === "Culmulative Depth"
  );

  return (
    <>
      {fossilRaceCategory ? (
        <>
          <h3>Fossil Race</h3>
          <p>
            The teams race to finish the fossil collection, where the required
            amount of each of the {fossilRaceCategory.objectives.length} Fossils
            has to be collected.{" "}
            {racePointsToText(fossilRaceCategory.scoring_preset?.points || [])}
          </p>
        </>
      ) : null}
      {culmDepthObjective ? (
        <>
          <h3>Culmulative Team Depth</h3>
          <p>
            Total team delve progress is equal to a sum of everyone&apos;s
            individual solo depth progress past 100 depth. Each team gets 1
            point per 10 total team delve progress up to a cap of 500 points.
          </p>
        </>
      ) : null}
    </>
  );
}
