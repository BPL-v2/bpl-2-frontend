import { Team } from "../client";

interface TeamNameProps {
  team?: Team;
  className?: string;
}
export function TeamName({ team, className }: TeamNameProps) {
  if (!team) {
    return <div className={className}>-</div>;
  }
  return (
    <div className={className} style={{ color: team.color }}>
      {team.name}
    </div>
  );
}
