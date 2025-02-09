import { Condition, ObjectiveType } from "./scoring-objective";
import { ScoringPreset } from "./scoring-preset";
import { Team } from "./team";
import { MinimalUser } from "./user";

export type ScoreMap = { [key: string]: ScoreDiff };

export type ScoreDiff = {
  score: Score;
  diff_type: "Added" | "Removed" | "Changed" | "Unchanged";
  field_diff: String[];
  key: string;
};

export type ScoreDiffMeta = {
  category: ScoreCategory | null;
  objective: ScoreObjective | null;
  userName: string | null;
  finished: boolean;
  teamName: string;
  rank: number;
  points: number;
};

export function findCategoryById(
  id: number,
  category?: ScoreCategory
): ScoreCategory | null {
  if (!category) {
    return null;
  }
  if (category.id === id) {
    return category;
  }
  for (const subCategory of category.sub_categories) {
    const found = findCategoryById(id, subCategory);
    if (found) {
      return found;
    }
  }
  return null;
}

export function findObjectiveById(
  id: number,
  category?: ScoreCategory
): ScoreObjective | null {
  if (!category) {
    return null;
  }
  for (const objective of category.objectives) {
    if (objective.id === id) {
      return objective;
    }
  }
  for (const subCategory of category.sub_categories) {
    const found = findObjectiveById(id, subCategory);
    if (found) {
      return found;
    }
  }
  return null;
}

export function getMetaInfo(
  scoreDiff: ScoreDiff,
  users: MinimalUser[],
  scores?: ScoreCategory,
  teams?: Team[]
): ScoreDiffMeta {
  const meta: ScoreDiffMeta = {
    category: null,
    objective: null,
    userName: null,
    teamName: "",
    finished: false,
    points: 0,
    rank: 0,
  };
  const type = scoreDiff.key.split("-")[0];
  const id = parseInt(scoreDiff.key.split("-")[1]);
  const teamId = scoreDiff.key.split("-")[2];
  if (type === "C") {
    meta.category = findCategoryById(id, scores);
  } else if (type === "O") {
    meta.objective = findObjectiveById(id, scores);
    if (meta.objective) {
      meta.category = findCategoryById(meta.objective.category_id, scores);
    }
  }
  meta.teamName =
    teams?.find((team) => team.id === parseInt(teamId))?.name || "";
  meta.userName =
    users.find((user) => user.id === scoreDiff.score.user_id)?.display_name ||
    null;
  meta.finished = scoreDiff.score.finished;
  meta.rank = scoreDiff.score.rank;
  meta.points = scoreDiff.score.points;
  return meta;
}

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
  category_id: number;
};

export type ScoreCategory = {
  id: number;
  name: string;
  sub_categories: ScoreCategory[];
  objectives: ScoreObjective[];
  scoring_preset: ScoringPreset | null;
  team_score: TeamScore;
};
