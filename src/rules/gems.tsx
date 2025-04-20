import { JSX, useContext } from "react";
import { GlobalStateContext } from "@utils/context-provider";

function convertArrayToText(points: number[]): JSX.Element[] {
  const textParts = points.map((point, index) => {
    if (index === 0) {
      return (
        <span key={index}>
          The first team to complete collect all gems will be awarded{" "}
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
export function GemTabRules() {
  const { scores } = useContext(GlobalStateContext);

  const gemCategory = scores?.sub_categories.find(
    (category) => category.name === "Gems"
  );
  const racePoints = gemCategory?.objectives[0].scoring_preset?.points || [];
  const gemPoints = gemCategory?.objectives[1].scoring_preset?.points[0];
  return (
    <>
      <h3>Points</h3>
      <p>
        Every team tries to collect all transfigured gems as fast as possible.{" "}
        {convertArrayToText(racePoints)}. Every transfigured gem collected will
        award <b className="text-info">{gemPoints}</b> points.
      </p>
    </>
  );
}
