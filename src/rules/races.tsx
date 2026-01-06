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

  const raceCategory = scores?.children.find(
    (category) => category.name === "Races",
  );
  // const scoringPresets = Object.entries(
  //   raceCategory?.children.reduce((acc, objective) => {
  //     if (objective.scoring_preset)
  //       acc[objective.scoring_preset.name] = objective.scoring_preset;
  //     return acc;
  //   }, {} as Record<string, ScoringPreset | undefined>) || {}
  // );
  const racePoints = raceCategory?.children[0].scoring_presets[0]?.points || [];
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
      <h3 className="text-warning">Notes</h3>
      <p className="text-warning">
        Item, delve and pantheon bounties are tracked automatically and do not
        need to be submitted manually. It is still advised to take a screenshot
        of your completion in case there are disputes as the tracking can be off
        about a minute.
      </p>
      <p className="text-warning">
        The endless chase race can be submitted multiple times per team with
        different numbers of Timeless Jewels dropped. If two teams have the same
        amount of jewels dropped, the team that submitted first will get more
        points.
      </p>
    </>
  );
}
