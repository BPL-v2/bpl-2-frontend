import { useContext } from "react";
import { ascendancies, phreciaMapping, poe2Mapping } from "../types/ascendancy";
import { GlobalStateContext } from "../utils/context-provider";

interface AscendancyProps {
  character_class: string;
}

export function Ascendancy({ character_class }: AscendancyProps) {
  const { gameVersion } = useContext(GlobalStateContext);
  const class_name =
    phreciaMapping[character_class] ||
    poe2Mapping[character_class] ||
    character_class;
  const ascendancy = ascendancies[gameVersion];
  if (!ascendancy || !ascendancy[class_name]) {
    return character_class;
  }

  return (
    <p className={`font-bold ${ascendancy[class_name].classColor}`}>
      {class_name}
    </p>
  );
}
