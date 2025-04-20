import { Objective, GameVersion } from "@client/api";
import { ScoreObjective } from "@mytypes/score";
import { getImageLocation, getItemName } from "@mytypes/scoring-objective";

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
    return <></>;
  }
  let wikilink: string | undefined = undefined;
  if (itemName) {
    if (gameVersion === GameVersion.poe1) {
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
      className="select-none flex items-center justify-center cursor-pointer"
      href={wikilink}
      target="_blank"
    >
      <img className={className || "max-w-14 max-h-14"} src={img_location} />
    </a>
  );
}
