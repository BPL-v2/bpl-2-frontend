import { useContext } from "react";
import { ascendancies, phreciaMapping, poe2Mapping } from "@mytypes/ascendancy";
import { GlobalStateContext } from "@utils/context-provider";
import { GameVersion } from "@client/api";
import { twMerge } from "tailwind-merge";

interface AscendancyProps {
  character_class: string;
}

export function AscendancyName({ character_class }: AscendancyProps) {
  const { currentEvent } = useContext(GlobalStateContext);
  const class_name =
    phreciaMapping[character_class] ||
    poe2Mapping[character_class] ||
    character_class;
  const ascendancy = ascendancies[currentEvent.game_version];
  if (!ascendancy || !ascendancy[class_name]) {
    return character_class;
  }
  return (
    <span
      className={twMerge("font-semi-bold", ascendancy[class_name].classColor)}
    >
      {currentEvent.game_version === GameVersion.poe1
        ? character_class
        : class_name}
    </span>
  );
}
