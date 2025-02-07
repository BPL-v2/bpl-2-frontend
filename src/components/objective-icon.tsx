import { ScoreObjective } from "../types/score";
import {
  getImageLocation,
  getItemName,
  ScoringObjective,
} from "../types/scoring-objective";

export type ObjectiveIconProps = {
  objective: ScoreObjective | ScoringObjective;
  gameVersion: "poe1" | "poe2";
  style?: React.CSSProperties;
};

export function ObjectiveIcon({
  objective,
  gameVersion,
  style,
}: ObjectiveIconProps) {
  const img_location = getImageLocation(objective, gameVersion);
  const itemName = getItemName(objective);
  if (!img_location) {
    return <></>;
  }
  let wikilink: string | undefined = undefined;
  if (itemName) {
    if (gameVersion === "poe1") {
      wikilink = `https://www.poewiki.net/wiki/${itemName.replaceAll(
        " ",
        "_"
      )}`;
    } else {
      wikilink = `https://www.poe2wiki.net/wiki/${itemName.replaceAll(
        " ",
        "_"
      )}`;
    }
  }

  return (
    <a
      className="select-none"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: itemName ? "pointer" : "default",
      }}
      href={wikilink}
      target="_blank"
    >
      <img
        src={img_location}
        style={{ maxWidth: "3.5em", maxHeight: "3.5em", ...style }}
      />
    </a>
  );
}
