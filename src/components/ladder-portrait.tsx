import { LadderEntry, Team } from "@client/api";
import { AscendancyName } from "./ascendancy-name";
import { AscendancyPortrait } from "./ascendancy-portrait";
import { ExperienceBar } from "./experience-bar";
import { getSkillColor } from "@utils/gems";
import { Link } from "@tanstack/react-router";
import { GlobalStateContext } from "@utils/context-provider";
import { useContext } from "react";

interface Props {
  entry: LadderEntry;
  team?: Team;
}

export function LadderPortrait({ entry, team }: Props) {
  const { currentEvent } = useContext(GlobalStateContext);
  return (
    <Link
      className="flex w-100 flex-row items-center gap-5"
      to={"/profile/$userId/$eventId/$characterId"}
      params={{
        userId: entry.character?.user_id || 0,
        characterId: entry.character?.id || "",
        eventId: currentEvent.id,
      }}
    >
      <AscendancyPortrait
        character_class={entry.character_class}
        className="h-20 w-20 rounded-full object-cover"
      />
      <div className="flex w-full flex-col">
        <span className="font-bold" style={{ color: team?.color || "inherit" }}>
          {entry.character_name}
        </span>
        <span
          className={getSkillColor(entry.character?.main_skill) + " font-bold"}
        >
          {entry.character?.main_skill}
        </span>
        <AscendancyName character_class={entry.character_class} />
        <div className="flex items-center gap-1">
          lvl
          <ExperienceBar experience={entry.experience} level={entry.level} />
        </div>
      </div>
    </Link>
  );
}
