import { Team } from "@client/api";
import { useState } from "react";

export function TeamLogo({ team, eventId }: { team?: Team; eventId: number }) {
  const [errorCount, setErrorCount] = useState(0);
  if (!team?.name) return null;
  if (errorCount == 2) {
    return (
      <div
        className="w-full h-full text-center m-auto flex flex-col items-center justify-center text-2xl font-bold"
        style={{ backgroundColor: team.color }}
      >
        {team.name}
      </div>
    );
  }
  return (
    <img
      onError={(e) => {
        setErrorCount(errorCount + 1);
        e.currentTarget.src = `/assets/teams/${
          eventId
        }/${team?.name.toLowerCase()}/logo-w-name.png`;
      }}
      src={`/assets/teams/${
        eventId
      }/${team?.name.toLowerCase()}/logo-w-name.svg`}
      alt={team?.name || "Team Logo"}
    />
  );
}
