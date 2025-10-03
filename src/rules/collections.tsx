import { JSX, useContext } from "react";
import { GlobalStateContext } from "@utils/context-provider";

function convertArrayToText(points: number[]): JSX.Element[] {
  const textParts = points.map((point, index) => {
    if (index === 0) {
      return (
        <span key={index}>
          The first team to complete the collection will be awarded{" "}
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
export function CollectionTabRules() {
  const { scores } = useContext(GlobalStateContext);

  const collectionCategory = scores?.children.find(
    (category) => category.name === "Collections",
  );

  const racePoints =
    collectionCategory?.children[0]?.scoring_preset?.points || [];

  return (
    <>
      <h3>Points</h3>
      <p>
        Completing a collection goal awards points to the team depending on the
        time of completion. {convertArrayToText(racePoints)}
      </p>
      <h3 className="text-warning">Notes </h3>
      <p className="text-warning">
        Collection completions are tracked automatically by the system. All
        items that contribute to the completion <b>must</b> be located in the
        same public stash tab - so the progress bar displayed might be
        misleading.
      </p>
    </>
  );
}
