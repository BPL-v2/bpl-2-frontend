import { useContext } from "react";
import { GameVersion } from "../client";
import {
  ascendancies,
  ClassDef,
  phreciaMapping,
  poe2Mapping,
} from "../types/ascendancy";
import { GlobalStateContext } from "../utils/context-provider";

interface AscendancyProps {
  character_class: string;
  className?: string;
}

export function AscendancyPortrait({
  character_class,
  className,
}: AscendancyProps) {
  const { gameVersion } = useContext(GlobalStateContext);
  let classObj: ClassDef;
  if (gameVersion === GameVersion.poe1) {
    classObj =
      ascendancies[gameVersion][
        phreciaMapping[character_class as keyof typeof phreciaMapping]
      ];
  } else {
    const className =
      poe2Mapping[
        character_class as keyof (typeof ascendancies)[GameVersion.poe2]
      ];

    classObj = ascendancies[gameVersion][className];
  }
  if (!classObj) {
    return character_class;
  }
  return <img src={classObj.thumbnail} className={className} />;
}
