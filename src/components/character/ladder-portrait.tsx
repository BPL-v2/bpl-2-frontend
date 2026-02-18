import { LadderEntry, Team } from "@client/api";
import { getSkillColor } from "@utils/gems";
import { Link } from "@tanstack/react-router";
import { GlobalStateContext } from "@utils/context-provider";
import { useContext } from "react";
import { AscendancyName } from "./ascendancy-name";
import { AscendancyPortrait } from "./ascendancy-portrait";
import { ExperienceBar } from "./experience-bar";

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
        userId: entry.user_id || 0,
        characterId: entry.character_id || "",
        eventId: currentEvent.id,
      }}
    >
      <AscendancyPortrait
        character_class={entry.ascendancy}
        className="size-20 rounded-full object-cover"
      />
      <div className="flex w-full flex-col">
        <span className="font-bold" style={{ color: team?.color || "inherit" }}>
          {entry.character_name}
        </span>
        <span className={getSkillColor(entry.main_skill) + " font-bold"}>
          {entry.main_skill}
        </span>
        <AscendancyName
          character_class={entry.ascendancy}
          className="font-bold"
        />
        <div className="flex items-center gap-1">
          lvl
          <ExperienceBar experience={entry.xp} level={entry.level} />
        </div>
      </div>
    </Link>
  );
}
