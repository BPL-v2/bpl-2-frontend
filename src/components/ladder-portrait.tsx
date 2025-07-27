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
      className="flex flex-row gap-5 items-center w-100"
      to={`/profile/$userId/$eventId/$characterId`}
      params={{
        userId: entry.character?.user_id || 0,
        characterId: entry.character?.id || "",
        eventId: currentEvent.id,
      }}
    >
      <AscendancyPortrait
        character_class={entry.character_class}
        className="w-20 h-20 rounded-full"
      />
      <div className="flex flex-col w-full">
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
