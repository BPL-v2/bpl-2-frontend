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

  const culmDepthRace = delveCategory?.objectives.find(
    (c) => c.name === "Culmulative Depth Race"
  );

  const delveRace = delveCategory?.objectives.find(
    (c) => c.name === "Delve Race"
  );

  return (
    <>
      {fossilRaceCategory && (
        <>
          <h3>Fossil Race</h3>
          <p>
            The teams race to finish the fossil collection, where the required
            amount of each of the {fossilRaceCategory.objectives.length} Fossils
            has to be collected.{" "}
            {racePointsToText(fossilRaceCategory.scoring_preset?.points || [])}
          </p>
        </>
      )}
      {culmDepthObjective && (
        <>
          <h3>Culmulative Team Depth</h3>
          <p>
            Total team delve progress is equal to a sum of everyone&apos;s
            individual solo depth progress past 100 depth. Each team gets{" "}
            <b className="text-info">1 point per 10</b> total team delve
            progress up to a cap of <b className="text-info">500</b> points.
          </p>
          {culmDepthRace && (
            <p>
              {racePointsToText(culmDepthRace.scoring_preset?.points || [])}
            </p>
          )}
        </>
      )}
      {delveRace && (
        <>
          <h3>Delve Race</h3>
          <p>
            Each team selects a member to be their racer. The racer will try to
            delve from depth 300 to depth 600 as fast as possible. The race has
            to be done solo.
          </p>
          <p className="text-warning">
            Usage of "Mageblood" and "The Tides of Time" unique belts is not
            allowed for the submission of the delve race.
          </p>
        </>
      )}
    </>
  );
}
