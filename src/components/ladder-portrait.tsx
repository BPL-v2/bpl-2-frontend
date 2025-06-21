import { LadderEntry } from "@client/api";
import { AscendancyName } from "./ascendancy-name";
import { AscendancyPortrait } from "./ascendancy-portrait";
import { ExperienceBar } from "./experience-bar";

interface Props {
  entry: LadderEntry;
  teamName?: string;
}

export function LadderPortrait({ entry, teamName }: Props) {
  return (
    <div className="ladder-portrait flex flex-row gap-3 items-center ">
      <AscendancyPortrait
        character_class={entry.character_class}
        className="w-18 h-18"
      />
      <div>
        <p className="font-bold">{entry.character_name}</p>
        <p className="text-sm">{teamName}</p>
        <AscendancyName character_class={entry.character_class} />
        <div className="flex items-center gap-1">
          lvl
          <ExperienceBar experience={entry.experience} level={entry.level} />
        </div>
      </div>
    </div>
  );
}
