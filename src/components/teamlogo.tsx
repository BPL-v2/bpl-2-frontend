import { Team } from "@client/api";
import { useState } from "react";

export function TeamLogo({ team, eventId }: { team?: Team; eventId: number }) {
  const [hasErrored, setHasErrored] = useState(false);
  if (!team?.name) return null;
  return (
    <img
      onError={(e) => {
        if (hasErrored) return; // Prevent infinite loop of errors
        e.currentTarget.src = `/assets/teams/${
          eventId
        }/${team?.name.toLowerCase()}/logo-w-name.png`;
        setHasErrored(true);
      }}
      src={`/assets/teams/${
        eventId
      }/${team?.name.toLowerCase()}/logo-w-name.svg`}
      alt={team?.name || "Team Logo"}
    />
  );
}
