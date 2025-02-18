import {
  Category,
  MinimalUser,
  Objective,
  Score,
  ScoreDiff,
  Team,
} from "../client";

export type ScoreMap = { [key: string]: ScoreDiff };

export type ScoreDiffWithKey = ScoreDiff & {
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
  scoreDiff: ScoreDiffWithKey,
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
      if (
        meta.category &&
        meta.category.scoring_preset?.scoring_method === "BONUS_PER_COMPLETION"
      ) {
        const finishedObjectives = Math.min(
          meta.category.objectives.filter(
            (objective) => objective.team_score[parseInt(teamId)].finished
          ).length,
          meta.category.scoring_preset.points.length - 1
        );
        meta.points += meta.category.scoring_preset.points[finishedObjectives];
      }
    }
  }
  meta.teamName =
    teams?.find((team) => team.id === parseInt(teamId))?.name || "";
  meta.userName =
    users.find((user) => user.id === scoreDiff.score.user_id)?.display_name ||
    null;
  meta.finished = scoreDiff.score.finished;
  meta.rank = scoreDiff.score.rank;
  meta.points += scoreDiff.score.points;
  return meta;
}

export type ScoreLite = {
  points: number;
  user_id: number;
  rank: number;
  timestamp: Date;
  number: number;
  finished: boolean;
};

export type TeamScore = { [teamId: number]: Score };

export type ScoreObjective = Objective & {
  team_score: TeamScore;
};

export type ScoreCategory = Omit<Category, "sub_categories" | "objectives"> & {
  sub_categories: ScoreCategory[];
  objectives: ScoreObjective[];
  team_score: TeamScore;
};
