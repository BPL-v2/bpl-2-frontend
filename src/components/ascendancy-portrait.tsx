import { useContext } from "react";
import { ascendancies, phreciaMapping, poe2Mapping } from "@mytypes/ascendancy";
import { GlobalStateContext } from "@utils/context-provider";

interface AscendancyProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  character_class: string;
}

export function AscendancyPortrait({
  character_class,
  ...props
}: AscendancyProps) {
  const { currentEvent } = useContext(GlobalStateContext);
  const asc = ascendancies[currentEvent.game_version];
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
  return <img src={asc[char].thumbnail} alt={char} {...props} />;
}
