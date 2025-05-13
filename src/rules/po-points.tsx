import { JSX, useContext } from "react";
import { GlobalStateContext } from "@utils/context-provider";
function convertArrayToText(points: number[]): JSX.Element[] {
  const textParts = points.map((point, index) => {
    if (index === 0) {
      return (
        <span key={index}>
          The team with the most progress will be awarded{" "}
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

export function POPointRules() {
  const { scores } = useContext(GlobalStateContext);
  const objs = scores?.sub_categories.find(
    (category) => category.name === "Personal Objectives"
  )?.objectives;
  if (!objs) {
    return <></>;
  }
  const totalObjective = objs.find(
    (obj) => obj.scoring_preset?.point_cap || 0 > 0
  );
  const checkPoints = objs.filter((obj) => !obj.scoring_preset?.point_cap);
  return (
    <>
      <h3>Personal Objective Points</h3>
      <p>
        Players can earn personal objective points for their team by progressing
        their character. Each of these milestones will award{" "}
        <b className="text-info">3</b> points up to a maximum of{" "}
        <b className="text-info">9</b> points per player and a maximum of{" "}
        <b className="text-info">
          {totalObjective?.scoring_preset?.point_cap}{" "}
        </b>{" "}
        points per team:
      </p>
      <ul>
        <li>Reach level 80</li>
        <li>Reach level 90</li>
        <li>Complete the Eternal (Uber) Labyrinth</li>
        <li>Allocate 40 Atlas Nodes</li>
      </ul>
      {checkPoints.length > 0 && (
        <>
          <h3>PO Checkpoints</h3>
          <p>
            During the event there will be {checkPoints.length} checkpoints,
            awarding the team that has made the most progress in the specified
            time period with extra points.{" "}
            {convertArrayToText(checkPoints[0].scoring_preset?.points || [])}
          </p>
        </>
      )}
    </>
  );
}
