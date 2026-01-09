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
  const objs = scores?.children.find(
    (category) => category.name === "Personal Objectives",
  )?.children;
  if (!objs) {
    return <></>;
  }
  const totalObjective = objs.find(
    (obj) => obj.scoring_presets[0]?.point_cap || 0 > 0,
  );
  const checkPoints = objs.filter((obj) => !obj.scoring_presets[0]?.point_cap);
  return (
    <>
      <h3>Personal Objective Points</h3>
      <p>
        Players can earn personal objective points for their team by progressing
        their character. Each player can earn a maximum of{" "}
        <b className="text-info">9</b> points for a team score maximum of{" "}
        <b className="text-info">
          {totalObjective?.scoring_presets[0]?.point_cap}{" "}
        </b>{" "}
        points per team. These are the challenges that can be completed to earn
        points:
      </p>
      <ul>
        <li>
          Reach level 40 <b className="text-info"> +1</b>
        </li>

        <li>
          Reach level 60 <b className="text-info"> +1</b>
        </li>
        <li>
          Reach level 80 <b className="text-info"> +1</b>
        </li>
        <li>
          Complete the Cruel Labyrinth <b className="text-info"> +1</b>
        </li>
        <li>
          Complete the Merc Labyrinth <b className="text-info"> +1</b>
        </li>
        <li>
          Complete the Uber Labyrinth <b className="text-info"> +1</b>
        </li>
        <li>
          Reach level 90 <b className="text-info"> +3</b>
        </li>
        <li>
          Allocate 40 Atlas Nodes <b className="text-info"> +3</b>
        </li>
      </ul>
      {checkPoints.length > 0 && (
        <>
          <h3>PO Checkpoints</h3>
          <p>
            During the event there will be {checkPoints.length} checkpoints,
            awarding the team that has made the most progress in the specified
            time period with extra points.{" "}
            {convertArrayToText(
              checkPoints[0].scoring_presets[0]?.points || [],
            )}
          </p>
        </>
      )}
    </>
  );
}
