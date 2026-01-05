import { Objective, GameVersion } from "@client/api";
import { ScoreObjective } from "@mytypes/score";
import { getImageLocation, getItemName } from "@mytypes/scoring-objective";
import { twMerge } from "tailwind-merge";

export type ObjectiveIconProps = {
  objective: ScoreObjective | Objective;
  gameVersion: GameVersion;
  className?: string;
};

export function ObjectiveIcon({
  objective,
  gameVersion,
  className,
}: ObjectiveIconProps) {
  const img_location = getImageLocation(objective, gameVersion);
  const itemName = getItemName(objective);
  if (!img_location) {
    return;
    // return <div className={twMerge("size-14", className)}> </div>;
  }
  let wikilink: string | undefined = undefined;
  if (itemName) {
    if (gameVersion === GameVersion.poe1) {
      wikilink = `https://www.poewiki.net/wiki/${itemName.replaceAll(
        " ",
        "_",
      )}`;
    } else {
      wikilink = `https://www.poe2wiki.net/wiki/${itemName.replaceAll(
        " ",
        "_",
      )}`;
    }
  }

  return (
    <a
      className={twMerge(
        "flex size-14 items-center justify-center",
        wikilink && "cursor-pointer",
        className,
      )}
      href={wikilink}
      target="_blank"
    >
      <img
        className={twMerge("max-h-14", className)}
        src={img_location}
        alt={itemName || img_location}
      />
    </a>
  );
}
