import { EventStatus } from "./event";

export interface Team {
  id: number;
  name: string;
  allowed_classes: string[];
}

export interface TeamCreate {
  name: string;
  allowed_classes: string[];
}
export interface TeamUpdate {
  name?: string;
  allowed_classes?: string[];
}

export function teamSort(
  eventStatus: EventStatus | undefined
): (teamA: Team, teamB: Team) => number {
  return (teamA, teamB) => {
    if (eventStatus) {
      if (teamA.id === eventStatus.team_id) {
        return -1;
      }
      if (teamB.id === eventStatus.team_id) {
        return 1;
      }
    }
    return teamA.id - teamB.id;
  };
}
