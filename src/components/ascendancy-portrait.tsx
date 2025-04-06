import { useContext } from "react";
import { ascendancies, phreciaMapping, poe2Mapping } from "../types/ascendancy";
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
  const asc = ascendancies[gameVersion];
  if (!asc) {
    return null;
  }
  const char =
    phreciaMapping[character_class] ||
    poe2Mapping[character_class] ||
    character_class;
  if (!asc[char]) {
    return null;
  }
  return <img src={asc[char].thumbnail} className={className} />;
}
