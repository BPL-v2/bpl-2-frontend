import type { Team } from "./team";

export interface BPLEvent {
  id: number;
  name: string;
  ladder_pages: number;
  is_current: boolean;
  teams: Team[];
  scoring_category_id: number;
  max_size: number;
  application_start_time: string;
  event_start_time: string;
  event_end_time: string;
}

export interface EventStatus {
  team_id?: number;
  application_status: EventStatusEnum;
}

export enum EventStatusEnum {
  Applied = "applied",
  Accepted = "accepted",
  Waitlisted = "waitlisted",
  None = "none",
}
