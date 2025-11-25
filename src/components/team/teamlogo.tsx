import { Team } from "@client/api";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

interface TeamLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  team?: Team;
  eventId: number;
}

export function TeamLogo({ team, eventId, ...props }: TeamLogoProps) {
  // TODO: CHANGE BACK TO 0 ONCE LOGOS ARE AVAILABLE
  const [errorCount, setErrorCount] = useState(1);
  if (!team?.name) return null;
  if (errorCount == 1) {
    return (
      <div
        {...props}
        className={twMerge(
          "flex h-full w-full flex-row items-center justify-center rounded-box",
          props.className,
        )}
        style={{ ...props.style, backgroundColor: team.color }}
      >
        <div className="text-center text-2xl font-bold text-base-100">
          {team.name}
        </div>
      </div>
    );
  }
  return (
    <img
      {...props}
      onError={() => {
        setErrorCount(errorCount + 1);
      }}
      src={`/assets/team/${eventId}/${team?.name.replaceAll(" ", "").replaceAll("-", "").toLowerCase()}-min`}
      alt={team?.name || "Team Logo"}
    />
  );
}
