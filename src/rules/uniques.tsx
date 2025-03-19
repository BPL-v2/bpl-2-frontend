import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { ScoringMethod } from "../client";
import { pointsToGroup } from "../utils/text-utils";

function convertArrayToText(points: number[] | undefined): string {
  const groups = pointsToGroup(points || []);
  const textParts = groups.map((group, index) => {
    if (index === 0) {
      return `The first ${group.count} items award ${group.value} points`;
    } else if (index === groups.length - 1) {
      return `and the remaining items award ${group.value} points`;
    } else {
      return `the next ${group.count} items award ${group.value} points`;
    }
  });
  return textParts.join(", ");
}

export function UniqueTabRules() {
  const { currentEvent, scores, gameVersion } = useContext(GlobalStateContext);

  const uniqueCategory = scores?.sub_categories.find(
    (category) => category.name === "Uniques"
  );
  const variantPoints = 5;
  const uniquePoints = 10;

  if (!uniqueCategory || !currentEvent) {
    return <></>;
  }
  // const categoryScoringMethods = uniqueCategory.sub_categories.reduce(
  //   (acc, category) => {
  //     if (category.scoring_preset)
  //       acc[category.scoring_preset.name] = category.scoring_preset;
  //     return acc;
  //   },
  //   {} as Record<string, ScoringPreset | undefined>
  // );
  // const objectiveScoringMethods = uniqueCategory.sub_categories
  //   .flatMap((c) => c.objectives)
  //   .reduce((acc, objective) => {
  //     if (objective.scoring_preset)
  //       acc[objective.scoring_preset.name] = objective.scoring_preset;
  //     return acc;
  //   }, {} as Record<string, ScoringPreset | undefined>);

  const wikiBaseUrl =
    gameVersion === "poe1"
      ? "https://www.poewiki.net/wiki/"
      : "https://www.poe2wiki.net/wiki/";
  const variantExample = uniqueCategory.sub_categories
    .flatMap((c) => c.sub_categories)
    .find((c) => c.name.includes("Variants") && c.objectives.length >= 2);

  const ubersCategory = uniqueCategory.sub_categories.find(
    (c) =>
      c.scoring_preset?.scoring_method === ScoringMethod.BONUS_PER_COMPLETION
  );

  const exampleText = variantExample ? (
    <p>
      For example{" "}
      <a
        className="text-orange-500 no-underline cursor-pointer text-nowrap"
        href={`${wikiBaseUrl}${variantExample.objectives[0].name.replaceAll(
          " ",
          "_"
        )}`}
        target="_blank"
      >
        {variantExample.objectives[0].name}
      </a>{" "}
      is a distinct unique item with variants such as{" "}
      <strong className="text-info text-nowrap">
        [{variantExample.objectives[0].extra}]
      </strong>{" "}
      or{" "}
      <strong className="text-info text-nowrap">
        [{variantExample.objectives[1].extra}]
      </strong>
      . Collecting both of these would award{" "}
      <b className="text-info">
        {uniquePoints}+{variantPoints}
      </b>{" "}
      points
    </p>
  ) : null;

  return (
    <>
      <h3>Unique Items</h3>
      <p>
        The teams try to find every unique item listed in the below sets. Every{" "}
        <i className="text-info">distinct</i> unique item found awards{" "}
        <b className="text-info">{uniquePoints}</b> points. Every{" "}
        <i className="text-info">variant</i> of a unique item found awards{" "}
        <b className="text-info"> {variantPoints}</b> points. Variants are items
        with the same name but distinct stats - they do not contribute to the
        set completion after the first.
      </p>
      {exampleText}
      <h3>Unique Sets</h3>
      <p>
        Once a team has found every distinct unique item in a unique set, they
        are considered to have completed the set. They are given points
        depending on the time they completed the set. The first team to complete
        a set is given 10 points, the second team 5 points.
      </p>
      {ubersCategory ? (
        <>
          <h3 className="text-error">Exceptions</h3>
          <p className="text-error">
            One exception to the aforementioned rules is the{" "}
            <i>{ubersCategory?.name}</i> set and it's items. Set completion does
            not grant any additional points and the more uniques that are found,
            the less points they award.{" "}
            {convertArrayToText(
              ubersCategory.scoring_preset?.points?.map((p) => p + uniquePoints)
            )}
          </p>
        </>
      ) : null}
      <h3 className="text-warning">Notes</h3>
      <p className="text-warning">
        Once a unique item has been scored it has to remain in the stash tab of
        a team member to ensure that no trading between teams takes place. The
        time of first discovery is used to determine the order of completion, so
        don't worry about trading it to a team lead to hold on to it for you
        after its scored
      </p>
    </>
  );
}
