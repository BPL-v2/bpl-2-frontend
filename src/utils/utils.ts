import {
  Score,
  ScoreCategory,
  ScoreLite,
  ScoreObjective,
} from "../types/score";
import { ScoringCategory } from "../types/scoring-category";
import { ScoringObjective } from "../types/scoring-objective";
import { ScoringMethod, ScoringPreset } from "../types/scoring-preset";

export function getObjectiveIDs(category: ScoringCategory): number[] {
  return category.objectives.map((objective) => objective.id);
}

export function getAllSubcategories(
  category: ScoringCategory
): ScoringCategory[] {
  const subcategories = [category, ...category.sub_categories];
  for (const subcategory of category.sub_categories) {
    subcategories.push(...getAllSubcategories(subcategory));
  }
  return subcategories;
}

type TeamScores = { [teamId: number]: Score };

type TeamScoreMap = { [scoreId: number]: TeamScores };

function getEmptyScore(): ScoreLite {
  return {
    points: 0,
    user_id: 0,
    rank: 0,
    timestamp: new Date(),
    number: 0,
    finished: false,
  };
}

export function getObjectiveTeamScores(
  scores: Score[],
  category: ScoringCategory
): TeamScoreMap {
  const objectiveIds = getAllSubcategories(category)
    .map((subcategory) => getObjectiveIDs(subcategory))
    .flat();
  return scores.reduce((acc: TeamScoreMap, score) => {
    if (objectiveIds.includes(score.id) && score.type === "OBJECTIVE") {
      if (!acc[score.id]) {
        acc[score.id] = {};
      }
      acc[score.id][score.team_id] = score;
    }
    return acc;
  }, {});
}

export function getCategoryTeamScores(
  scores: Score[],
  category: ScoringCategory
): TeamScoreMap {
  const categoryIds = getAllSubcategories(category).map(
    (subcategory) => subcategory.id
  );
  return scores.reduce((acc: TeamScoreMap, score) => {
    if (categoryIds.includes(score.id) && score.type === "CATEGORY") {
      if (!acc[score.id]) {
        acc[score.id] = {};
      }
      acc[score.id][score.team_id] = score;
    }
    return acc;
  }, {});
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
  category: ScoringCategory,
  scores: Score[],
  teamIds: number[],
  scoringPresets: ScoringPreset[]
): ScoreCategory {
  return mergeScoringCategory(
    category,
    getCategoryTeamScores(scores, category),
    getObjectiveTeamScores(scores, category),
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
  category: ScoringCategory,
  categoryTeamScores: TeamScoreMap,
  objectiveTeamScores: TeamScoreMap,
  teamsIds: number[],
  scoringPresets: { [presetId: number]: ScoringPreset }
): ScoreCategory {
  return {
    id: category.id,
    name: category.name,
    scoring_preset: category.scoring_preset_id
      ? scoringPresets[category.scoring_preset_id]
      : null,
    sub_categories: category.sub_categories.map((subcategory) =>
      mergeScoringCategory(
        subcategory,
        categoryTeamScores,
        objectiveTeamScores,
        teamsIds,
        scoringPresets
      )
    ),
    objectives: category.objectives.map((objective) =>
      mergeScoringObjective(
        objective,
        objectiveTeamScores,
        teamsIds,
        scoringPresets
      )
    ),
    team_score: teamsIds.reduce((acc: TeamScores, teamId) => {
      acc[teamId] =
        categoryTeamScores[category.id]?.[teamId] || getEmptyScore();
      return acc;
    }, {}),
  };
}

export function mergeScoringObjective(
  objective: ScoringObjective,
  objectiveTeamScores: TeamScoreMap,
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
      : null,
    team_score: teamsIds.reduce((acc: TeamScores, teamId) => {
      acc[teamId] =
        objectiveTeamScores[objective.id]?.[teamId] || getEmptyScore();
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

function getPotentialPointsForCategory(category: ScoreCategory) {
  const points: { [teamId: number]: number } = {};
  for (const [teamId, teamScore] of Object.entries(category.team_score)) {
    if (teamScore.points > 0) {
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
          )
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

function getPotentialPointsForObjective(objective: ScoreObjective) {
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
        )
      );
    }
  }
  return points;
}

export function getAllObjectives(category: ScoreCategory): ScoreObjective[] {
  const objectives = [...category.objectives];
  for (const subCategory of category.sub_categories) {
    objectives.push(...getAllObjectives(subCategory));
  }
  return objectives;
}
