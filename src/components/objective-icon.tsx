import { ScoreObjective } from "../types/score";
import {
  getImageLocation,
  getItemName,
  ScoringObjective,
} from "../types/scoring-objective";

export type ObjectiveIconProps = {
  objective: ScoreObjective | ScoringObjective;
};

export function ObjectiveIcon({ objective }: ObjectiveIconProps) {
  const img_location = getImageLocation(objective);
  const itemName = getItemName(objective);
  if (!img_location) {
    return <></>;
  }
  return (
    <a
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "3.5em",
        cursor: itemName ? "pointer" : "default",
      }}
      href={
        itemName
          ? `https://www.poe2wiki.net/wiki/${itemName.replaceAll(" ", "_")}`
          : undefined
      }
      target="_blank"
    >
      <img
        src={img_location}
        style={{ maxWidth: "3.5em", maxHeight: "3.5em" }}
      />
    </a>
  );
}
