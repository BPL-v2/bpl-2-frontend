import { Team } from "@client/api";

interface TeamNameProps {
  team?: Team;
  className?: string;
}
export function TeamName({ team, className }: TeamNameProps) {
  if (!team) {
    return <span className={className}>-</span>;
  }
  return (
    <span className={className} style={{ color: team.color }}>
      {team.name}
    </span>
  );
}
