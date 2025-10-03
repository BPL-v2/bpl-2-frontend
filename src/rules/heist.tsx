import { JSX, useContext } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import { getPointRules } from "@utils/rules";

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
          , the next team will get <b className="text-info">{point}</b> points
        </span>
      );
    }
  });
  return textParts;
}

export function HeistTabRules() {
  const { scores } = useContext(GlobalStateContext);

  const heistCategory = scores?.children.find(
    (category) => category.name === "Heist",
  );

  const rogueGearCategory = heistCategory?.children.find(
    (c) => c.name === "Rogue Gear",
  );

  const uniqueCategory = heistCategory?.children.find(
    (c) => c.name === "Blueprint Uniques",
  );

  const experimentalItemsCategory = heistCategory?.children.find(
    (c) => c.name === "Experimental Bases",
  );

  const echantingOrbObjective = heistCategory?.children.find(
    (c) => c.name === "Enchanting Orb Race",
  );

  return (
    <>
      {rogueGearCategory && getPointRules(rogueGearCategory)}
      {experimentalItemsCategory && getPointRules(experimentalItemsCategory)}
      {uniqueCategory && getPointRules(uniqueCategory)}
      {echantingOrbObjective && (
        <>
          <h3>Enchanting Orb Race </h3>
          <p>
            The teams are racing to find {echantingOrbObjective.required_number}{" "}
            Tailoring or Tempering Orbs in total, for example{" "}
            {echantingOrbObjective.required_number - 2} Tempering Orbs and 2
            Tailoring Orbs would count.{" "}
            {racePointsToText(
              echantingOrbObjective.scoring_preset?.points || [],
            )}
          </p>
        </>
      )}
    </>
  );
}
