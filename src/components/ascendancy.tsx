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
}

export function Ascendancy({ character_class }: AscendancyProps) {
  const { gameVersion } = useContext(GlobalStateContext);
  let classObj: ClassDef;
  let className = "";
  if (gameVersion === GameVersion.poe1) {
    classObj =
      ascendancies[gameVersion][
        phreciaMapping[character_class as keyof typeof phreciaMapping]
      ];
    className = character_class;
  } else {
    className =
      poe2Mapping[
        character_class as keyof (typeof ascendancies)[GameVersion.poe2]
      ];

    classObj = ascendancies[gameVersion][className];
  }
  if (!classObj) {
    return character_class;
  }
  return (
    <div className="flex items-center gap-2">
      <img
        src={classObj.thumbnail}
        alt={classObj.image}
        className="h-8 w-8 rounded-full"
      />
      <p className={`font-bold ${classObj.classColor}`}>{className}</p>
    </div>
  );
}
