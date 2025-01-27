import { ScoreObjective } from "../types/score";
import { getImageLocation, ScoringObjective } from "../types/scoring-objective";

export type ObjectiveIconProps = {
  objective: ScoreObjective | ScoringObjective;
};

export function ObjectiveIcon({ objective }: ObjectiveIconProps) {
  const img_location = getImageLocation(objective);
  if (!img_location) {
    return <></>;
  }
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "3.5em",
      }}
    >
      <img
        src={img_location}
        style={{ maxWidth: "3.5em", maxHeight: "3.5em" }}
      />
    </div>
  );
}
