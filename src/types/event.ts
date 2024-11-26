import type { Team } from "./team";

export interface BPLEvent {
  id: number;
  name: string;
  ladder_pages: number;
  is_current: boolean;
  teams: Team[];
  scoring_category_id: number;
}

export interface EventCreate {
  name: string;
  is_current: boolean;
}
export interface EventUpdate {
  name?: string;
  is_current?: boolean;
}
