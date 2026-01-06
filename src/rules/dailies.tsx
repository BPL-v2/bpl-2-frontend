import { JSX, useContext } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import { ScoringMethod } from "@client/api";

function convertArrayToText(points: number[]): JSX.Element[] {
  const textParts = points.map((point, index) => {
    if (index === 0) {
      return (
        <span key={index}>
          The first team to complete race dailies will be awarded{" "}
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
export function DailyTabRules() {
  const { scores } = useContext(GlobalStateContext);

  const dailyCategory = scores?.children.find(
    (category) => category.name === "Dailies",
  );
  const basePoints =
    dailyCategory?.children?.find(
      (objective) =>
        objective.scoring_presets[0]?.scoring_method === ScoringMethod.PRESENCE,
    )?.scoring_presets[0]?.points || [];

  const racePoints =
    dailyCategory?.children?.find(
      (objective) =>
        objective.scoring_presets[0]?.scoring_method ===
        ScoringMethod.RANKED_TIME,
    )?.scoring_presets[0]?.points || [];
  return (
    <>
      <h3> Releases </h3>
      <p>
        Dailies are released periodically (see the countdowns). These are
        objectives that require the participation of the entire team.
      </p>
      <h3> Expiry </h3>
      <p>
        After their release, the dailies will be completable for 24 hours (see
        countdowns). After that, they will grant no more points.
      </p>
      <h3>Points</h3>
      <p>
        Regular dailies grant <b className="text-info">{basePoints[0]}</b>{" "}
        points on completion. {convertArrayToText(racePoints)}.
      </p>
      <h3 className="text-warning">Notes </h3>
      <p className="text-warning">
        Daily completions are tracked automatically by the system. All items
        that contribute to the completion <b>must</b> be located in the same
        public stash tab - so the progress bar displayed might be misleading.
      </p>
    </>
  );
}
