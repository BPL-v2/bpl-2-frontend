import { Team } from "@client/api";

interface TeamNameProps extends React.HTMLAttributes<HTMLSpanElement> {
  team?: Team;
}
export function TeamName({ team, ...props }: TeamNameProps) {
  if (!team) {
    return <span {...props}>-</span>;
  }
  return (
    <span {...props} style={{ color: team.color }}>
      {team.name}
    </span>
  );
}
