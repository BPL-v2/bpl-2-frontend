import { User } from "./user";

export enum PlayTime {
  VERY_LOW = "0-2",
  LOW = "2-4",
  MEDIUM = "4-6",
  HIGH = "6-8",
  VERY_HIGH = "8-10",
  EXTREME = "10-12",
  NO_LIFE = "12+",
}

export type Signup = {
  id: number;
  user: User;
  timestamp: string;
  expected_playtime: PlayTime;
  team_id?: number;
};
