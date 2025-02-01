import { useContext } from "react";
import { ScoreObjective } from "../types/score";
import {
  getImageLocation,
  getItemName,
  ScoringObjective,
} from "../types/scoring-objective";
import { GlobalStateContext } from "../utils/context-provider";

export type ObjectiveIconProps = {
  objective: ScoreObjective | ScoringObjective;
};

export function ObjectiveIcon({ objective }: ObjectiveIconProps) {
  const { gameVersion } = useContext(GlobalStateContext);
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
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "3.5em",
        cursor: itemName ? "pointer" : "default",
      }}
      href={wikilink}
      target="_blank"
    >
      <img
        src={img_location}
        style={{ maxWidth: "3.5em", maxHeight: "3.5em" }}
      />
    </a>
  );
}
