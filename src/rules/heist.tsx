import { JSX, useContext } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import { pointsToGroup } from "@utils/text-utils";

function bpUniquePointsToText(points: number[] | undefined): JSX.Element[] {
  const groups = pointsToGroup(points || []);
  const textParts = groups.map((group, index) => {
    if (index === 0) {
      return (
        <span key={index}>
          the first <b className="text-info">{group.count}</b> items award{" "}
          <b className="text-info">{group.value}</b> points
        </span>
      );
    } else if (index === groups.length - 1) {
      return (
        <span key={index}>
          {" "}
          and the remaining items award{" "}
          <b className="text-info">{group.value}</b> points
        </span>
      );
    } else {
      return (
        <span key={index}>
          {" "}
          the next <b className="text-info">{group.count}</b> items award{" "}
          <b className="text-info">{group.value}</b> points
        </span>
      );
    }
  });
  return textParts;
}

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
    (category) => category.name === "Heist"
  );

  const rogueGearCategory = heistCategory?.children.find(
    (c) => c.name === "Rogue Gear"
  );

  const uniqueCategory = heistCategory?.children.find(
    (c) => c.name === "Blueprint Uniques"
  );

  const experimentalItemsCategory = heistCategory?.children.find(
    (c) => c.name === "Experimental Bases"
  );

  const echantingOrbObjective = heistCategory?.children.find(
    (c) => c.name === "Enchanting Orb Race"
  );

  return (
    <>
      {rogueGearCategory && (
        <>
          <h3>Rogue Gear Race</h3>
          <p>
            The teams race to finish the rogue gear collection.{" "}
            {racePointsToText(rogueGearCategory.scoring_preset?.points || [])}.
            The rogue gear pieces themselves do not award points.
          </p>
        </>
      )}
      {experimentalItemsCategory && (
        <>
          <h3>Experimental Bases</h3>
          <p>
            Every experimental base found awards{" "}
            <b className="text-info">
              {experimentalItemsCategory.children[0].scoring_preset?.points[0]}
            </b>{" "}
            points.{" "}
            {experimentalItemsCategory.scoring_preset
              ? racePointsToText(
                  experimentalItemsCategory.scoring_preset.points
                )
              : "Collecting all bases does not award additional points."}
          </p>
        </>
      )}
      {uniqueCategory && (
        <>
          <h3>Heist Uniques</h3>
          <p>
            The teams try to find every <i>Heist Uniques</i> - this means unique
            items that drop exclusively from blueprint curio boxes. To encourage
            hunting for rarer uniques,{" "}
            {bpUniquePointsToText(uniqueCategory.scoring_preset?.points)}.{" "}
            Collecting all uniques does not award additional points.
          </p>
        </>
      )}
      {echantingOrbObjective && (
        <>
          <h3>Enchanting Orb Race </h3>
          <p>
            The teams are racing to find {echantingOrbObjective.required_number}{" "}
            Tailoring or Tempering Orbs in total, for example{" "}
            {echantingOrbObjective.required_number - 2} Tempering Orbs and 2
            Tailoring Orbs would count.{" "}
            {racePointsToText(
              echantingOrbObjective.scoring_preset?.points || []
            )}
          </p>
        </>
      )}
    </>
  );
}
