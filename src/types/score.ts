import { Condition, ObjectiveType } from "./scoring-objective";
import { ScoringPreset } from "./scoring-preset";

export type ScoreMap = { [key: string]: ScoreDiff };

export type ScoreDiff = {
  score: Score;
  diff_type: "Added" | "Removed" | "Changed" | "Unchanged";
  field_diff: String[];
};

export type Score = {
  points: number;
  user_id: number;
  rank: number;
  timestamp: Date;
  number: number;
  finished: boolean;
};

export type ScoreLite = {
  points: number;
  user_id: number;
  rank: number;
  timestamp: Date;
  number: number;
  finished: boolean;
};

export type TeamScore = { [teamId: number]: ScoreLite };

export type ScoreObjective = {
  id: number;
  name: string;
  extra: string;
  required_number: number;
  conditions: Condition[];
  objective_type: ObjectiveType;
  valid_from: string | null;
  valid_to: string | null;
  aggregation: string;
  number_field: string;
  scoring_preset: ScoringPreset | null;
  team_score: TeamScore;
};

export type ScoreCategory = {
  id: number;
  name: string;
  sub_categories: ScoreCategory[];
  objectives: ScoreObjective[];
  scoring_preset: ScoringPreset | null;
  team_score: TeamScore;
};
