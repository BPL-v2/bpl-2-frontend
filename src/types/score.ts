import { ScoringCategory } from "./scoring-category";
import {
  Condition,
  ObjectiveType,
  ScoringObjective,
} from "./scoring-objective";
import { ScoringPreset } from "./scoring-preset";

type ScoreType = "OBJECTIVE" | "CATEGORY";

export type Score = {
  type: ScoreType;
  id: number;
  points: number;
  team_id: number;
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

export function getScoreCategory(
  category: ScoringCategory,
  scores: Score[]
): ScoreCategory {
  const categoryScores = scores.filter(
    (score) => score.type === "CATEGORY" && score.id === category.id
  );
  const teamScore: TeamScore = {};
  for (const score of categoryScores) {
    teamScore[score.team_id] = {
      points: score.points,
      user_id: score.user_id,
      rank: score.rank,
      timestamp: score.timestamp,
      number: score.number,
      finished: score.finished,
    };
  }
  const subCategories: ScoreCategory[] = category.sub_categories.map(
    (subCategory) => getScoreCategory(subCategory, scores)
  );
  const objectives = category.objectives.map((objective) =>
    getScoreObjective(objective, scores)
  );
  return {
    id: category.id,
    name: category.name,
    sub_categories: subCategories,
    objectives: objectives,
    scoring_preset: category.scoring_preset,
    team_score: teamScore,
  };
}

function getScoreObjective(
  objective: ScoringObjective,
  scores: Score[]
): ScoreObjective {
  const objectiveScores = scores.filter(
    (score) => score.type === "OBJECTIVE" && score.id === objective.id
  );
  const teamScore: TeamScore = {};
  for (const score of objectiveScores) {
    teamScore[score.team_id] = {
      points: score.points,
      user_id: score.user_id,
      rank: score.rank,
      timestamp: score.timestamp,
      number: score.number,
      finished: score.finished,
    };
  }
  return {
    id: objective.id,
    name: objective.name,
    extra: objective.extra,
    required_number: objective.required_number,
    conditions: objective.conditions,
    objective_type: objective.objective_type,
    valid_from: objective.valid_from,
    valid_to: objective.valid_to,
    aggregation: objective.aggregation,
    number_field: objective.number_field,
    scoring_preset: objective.scoring_preset,
    team_score: teamScore,
  };
}
