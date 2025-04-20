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
          {" "}
          the next team will get <b className="text-info">{point}</b> points
        </span>
      );
    }
  });
  return textParts;
}

export function HeistTabRules() {
  const { scores } = useContext(GlobalStateContext);

  const heistCategory = scores?.sub_categories.find(
    (category) => category.name === "Heist"
  );

  const rogueGearCategory = heistCategory?.sub_categories.find(
    (c) => c.name === "Rogue Gear"
  );

  const uniqueCategory = heistCategory?.sub_categories.find(
    (c) => c.name === "Blueprint Uniques"
  );

  const experimentalItemsCategory = heistCategory?.sub_categories.find(
    (c) => c.name === "Experimental Bases"
  );

  return (
    <>
      {rogueGearCategory ? (
        <>
          <h3>Rogue Gear Race</h3>
          <p>
            The teams race to finish the rogue gear collection.{" "}
            {racePointsToText(rogueGearCategory.scoring_preset?.points || [])}
          </p>
        </>
      ) : null}
      {experimentalItemsCategory ? (
        <>
          <h3>Experimental Bases</h3>
          <p>
            Every experimental base found awards{" "}
            <b className="text-info">
              {
                experimentalItemsCategory.objectives[0].scoring_preset
                  ?.points[0]
              }
            </b>{" "}
            points.{" "}
            {experimentalItemsCategory.scoring_preset
              ? racePointsToText(
                  experimentalItemsCategory.scoring_preset.points
                )
              : "Collecting all bases does not award additional points."}
          </p>
        </>
      ) : null}
      {uniqueCategory ? (
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
      ) : null}
    </>
  );
}
