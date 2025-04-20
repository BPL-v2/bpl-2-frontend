import {
  Category,
  Objective,
  Score,
  ScoreMap,
  ScoringMethod,
  ScoringPreset,
} from "@client/api";
import { ScoreCategory, ScoreObjective } from "@mytypes/score";

type TeamScores = { [teamId: number]: Score };

type TeamScoreMap = { [scoreId: number]: TeamScores };

function getEmptyScore(): Score {
  return {
    points: 0,
    user_id: 0,
    rank: 0,
    timestamp: new Date().toISOString(),
    number: 0,
    finished: false,
  };
}

export function getTotalTeamScores(
  categoryTeamScores: TeamScoreMap,
  getObjectiveTeamScores: TeamScoreMap
): { [teamId: number]: number } {
  const teamScores: { [teamId: number]: number } = {};
  for (const scoreId in categoryTeamScores) {
    for (const teamId in categoryTeamScores[scoreId]) {
      if (!teamScores[teamId]) {
        teamScores[teamId] = 0;
      }
      teamScores[teamId] += categoryTeamScores[scoreId][teamId].points;
    }
  }
  for (const scoreId in getObjectiveTeamScores) {
    for (const teamId in getObjectiveTeamScores[scoreId]) {
      if (!teamScores[teamId]) {
        teamScores[teamId] = 0;
      }
      teamScores[teamId] += getObjectiveTeamScores[scoreId][teamId].points;
    }
  }
  return teamScores;
}

export function mergeScores(
  category: Category,
  scores: ScoreMap,
  teamIds: number[],
  scoringPresets: ScoringPreset[]
): ScoreCategory {
  return mergeScoringCategory(
    category,
    scores,
    teamIds,
    scoringPresets.reduce(
      (acc: { [presetId: number]: ScoringPreset }, preset) => {
        acc[preset.id] = preset;
        return acc;
      },
      {}
    )
  );
}

export function mergeScoringCategory(
  category: Category,
  scores: ScoreMap,
  teamsIds: number[],
  scoringPresets: { [presetId: number]: ScoringPreset }
): ScoreCategory {
  return {
    id: category.id,
    name: category.name,
    scoring_preset: category.scoring_preset_id
      ? scoringPresets[category.scoring_preset_id]
      : undefined,
    sub_categories: category.sub_categories.map((subcategory) =>
      mergeScoringCategory(subcategory, scores, teamsIds, scoringPresets)
    ),
    objectives: category.objectives.map((objective) =>
      mergeScoringObjective(objective, scores, teamsIds, scoringPresets)
    ),
    team_score: teamsIds.reduce((acc: TeamScores, teamId) => {
      const key = "C-" + category.id + "-" + teamId;
      acc[teamId] = scores[key]?.score || getEmptyScore();
      return acc;
    }, {}),
  };
}

export function mergeScoringObjective(
  objective: Objective,
  scores: ScoreMap,
  teamsIds: number[],
  scoringPresets: { [presetId: number]: ScoringPreset }
): ScoreObjective {
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
    scoring_preset: objective.scoring_preset_id
      ? scoringPresets[objective.scoring_preset_id]
      : undefined,
    category_id: objective.category_id,
    team_score: teamsIds.reduce((acc: TeamScores, teamId) => {
      const key = "O-" + objective.id + "-" + teamId;
      acc[teamId] = scores[key]?.score || getEmptyScore();
      return acc;
    }, {}),
  };
}

export function getTotalPoints(category: ScoreCategory): {
  [teamId: number]: number;
} {
  const points: { [teamId: number]: number } = {};
  for (const [teamId, teamScore] of Object.entries(category.team_score)) {
    points[parseInt(teamId)] = teamScore.points;
  }
  for (const subCategory of category.sub_categories) {
    const subCategoryPoints = getTotalPoints(subCategory);
    for (const [teamId, teamPoints] of Object.entries(subCategoryPoints)) {
      points[parseInt(teamId)] += teamPoints;
    }
  }
  for (const objective of category.objectives) {
    for (const [teamId, teamScore] of Object.entries(objective.team_score)) {
      points[parseInt(teamId)] += teamScore.points;
    }
  }
  return points;
}

export function getPotentialPoints(category: ScoreCategory) {
  const points: { [teamId: number]: number } = {};
  for (const entry of Object.entries(getPotentialPointsForCategory(category))) {
    points[parseInt(entry[0])] = entry[1];
  }
  for (const subCategory of category.sub_categories) {
    const subCategoryPoints = getPotentialPoints(subCategory);
    for (const [teamId, teamPoints] of Object.entries(subCategoryPoints)) {
      if (!points[parseInt(teamId)]) {
        points[parseInt(teamId)] = 0;
      }
      points[parseInt(teamId)] += teamPoints;
    }
  }
  for (const objective of category.objectives) {
    for (const [teamId, teamScore] of Object.entries(
      getPotentialPointsForObjective(objective)
    )) {
      if (!points[parseInt(teamId)]) {
        points[parseInt(teamId)] = 0;
      }
      points[parseInt(teamId)] += teamScore;
    }
  }
  return points;
}

export function getPotentialPointsForCategory(category: ScoreCategory) {
  const points: { [teamId: number]: number } = {};
  for (const [teamId, teamScore] of Object.entries(category.team_score)) {
    if (teamScore.points != 0) {
      points[parseInt(teamId)] = teamScore.points;
    } else {
      if (!category.scoring_preset) {
        continue;
      }
      var maximumReachablePoints = 0;
      if (
        category.scoring_preset.scoring_method ===
        ScoringMethod.RANKED_COMPLETION_TIME
      ) {
        const maxRank = Object.values(category.team_score).reduce(
          (acc, score) => Math.max(acc, score.rank),
          0
        );
        maximumReachablePoints = Math.max(
          ...category.scoring_preset.points.slice(
            maxRank,
            category.scoring_preset.points.length
          ),
          category.scoring_preset.points[
            category.scoring_preset.points.length - 1
          ]
        );
      } else if (
        category.scoring_preset.scoring_method ===
        ScoringMethod.BONUS_PER_COMPLETION
      ) {
        for (var i = teamScore.number; i < category.objectives.length; i++) {
          maximumReachablePoints += getPoints(
            category.scoring_preset.points,
            i
          );
        }
      }
      points[parseInt(teamId)] = maximumReachablePoints;
    }
  }
  return points;
}

function getPoints(numbers: number[], index: number): number {
  if (index < numbers.length) {
    return numbers[index];
  }
  return numbers[numbers.length - 1];
}

export function getPotentialPointsForObjective(objective: ScoreObjective) {
  const points: { [teamId: number]: number } = {};
  for (const [teamId, teamScore] of Object.entries(objective.team_score)) {
    if (teamScore.points > 0) {
      points[parseInt(teamId)] = teamScore.points;
    } else {
      if (!objective.scoring_preset) {
        continue;
      }
      var maxRank = Object.values(objective.team_score).reduce(
        (acc, score) => Math.max(acc, score.rank),
        0
      );
      points[parseInt(teamId)] = Math.max(
        ...objective.scoring_preset.points.slice(
          maxRank,
          objective.scoring_preset.points.length
        ),
        objective.scoring_preset.points[
          objective.scoring_preset.points.length - 1
        ]
      );
    }
  }
  return points;
}

export function formToJson(form: HTMLFormElement): any {
  const data = {} as any;
  for (const [key, value] of new FormData(form).entries()) {
    if (data[key]) {
      if (Array.isArray(data[key])) {
        data[key].push(value);
      } else {
        data[key] = [data[key], value];
      }
    } else {
      data[key] = value;
    }
  }
  return data;
}

export function rank2text(rank: number) {
  if (rank === 0) {
    return "Unfinished";
  }
  if (rank === 1) {
    return "1st place";
  }
  if (rank === 2) {
    return "2nd place";
  }
  if (rank === 3) {
    return "3rd place";
  }
  return `${rank}th place`;
}
