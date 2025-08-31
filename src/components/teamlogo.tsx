import { Team } from "@client/api";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

interface TeamLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  team?: Team;
  eventId: number;
}

export function TeamLogo({ team, eventId, ...props }: TeamLogoProps) {
  const [errorCount, setErrorCount] = useState(0);
  if (!team?.name) return null;
  if (errorCount == 1) {
    return (
      <div
        {...props}
        className={twMerge(
          "w-full h-full text-center m-auto flex flex-col items-center justify-center text-2xl font-bold",
          props.className
        )}
        style={{ ...props.style, backgroundColor: team.color }}
      >
        {team.name}
      </div>
    );
  }
  return (
    <img
      {...props}
      onError={(e) => {
        setErrorCount(errorCount + 1);
      }}
      src={`/assets/teams/${eventId}/${team?.name.toLowerCase()}-min`}
      alt={team?.name || "Team Logo"}
    />
  );
}
