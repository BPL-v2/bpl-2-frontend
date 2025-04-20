import { JSX, useContext } from "react";
import { GlobalStateContext } from "@utils/context-provider";

function convertArrayToText(points: number[]): JSX.Element[] {
  const textParts = points.map((point, index) => {
    if (index === 0) {
      return (
        <span key={index}>
          The first team to complete the objective will be awarded{" "}
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
export function RaceTabRules() {
  const { scores } = useContext(GlobalStateContext);

  const raceCategory = scores?.sub_categories.find(
    (category) => category.name === "Races"
  );
  // const scoringPresets = Object.entries(
  //   raceCategory?.objectives.reduce((acc, objective) => {
  //     if (objective.scoring_preset)
  //       acc[objective.scoring_preset.name] = objective.scoring_preset;
  //     return acc;
  //   }, {} as Record<string, ScoringPreset | undefined>) || {}
  // );
  const racePoints = raceCategory?.objectives[0].scoring_preset?.points || [];
  return (
    <>
      <h3>Points</h3>
      <p>
        Every team tries to complete the race objectives as quickly as possible.{" "}
        {convertArrayToText(racePoints)}
      </p>
      <h3>Submitting a race completion</h3>
      <p>
        To submit a completion click on the plus sign icon on the race card and
        fill in the form. You will need to provide a timestamp in your timezone{" "}
        {" (your browser usually provides this for you) "} and a link to a proof
        of your completion. This can for example be a screenshot or a video that
        show your local clock. If there is more information you need to share
        for the reviewers you can add it in the comment field.
      </p>
      <p>
        BPL staff will manually credit points for races after the verification,
        if there are questions about a race condition please confirm with a BPL
        Admin or Manager prior to beginning the map/fight.
      </p>
    </>
  );
}
