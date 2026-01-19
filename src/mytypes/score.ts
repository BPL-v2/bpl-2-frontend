import {
  MinimalUser,
  Objective,
  ScoreDiff,
  Team,
  Score,
  ScoringMethod,
  AggregationType,
} from "@client/api";
import { getSubObjective } from "./scoring-objective";
import { isFinished } from "@utils/utils";

export type ScoreDiffMeta = {
  parent?: ScoreObjective;
  objective?: ScoreObjective;
  userName?: string;
  finished: boolean;
  teamName: string;
  rank: number;
  points: number;
};

export function getMetaInfo(
  scoreDiff: ScoreDiff,
  users?: MinimalUser[],
  scores?: ScoreObjective,
  teams?: Team[],
): ScoreDiffMeta {
  const meta: ScoreDiffMeta = {
    teamName: "",
    finished: false,
    points: 0,
    rank: 0,
  };
  meta.objective = getSubObjective(scores, scoreDiff.objective_id);
  if (meta.objective) {
    meta.parent = getSubObjective(scores, meta.objective.parent_id);
    const bonusPerCompletionPreset = meta.parent?.scoring_presets.find(
      (preset) => preset.scoring_method === "BONUS_PER_COMPLETION",
    );
    if (meta.parent && bonusPerCompletionPreset) {
      const finishedObjectives = Math.min(
        meta.parent.children.filter((objective) =>
          isFinished(objective.team_score[scoreDiff.team_id]),
        ).length,
        bonusPerCompletionPreset.points.length - 1,
      );
      meta.points += bonusPerCompletionPreset.points[finishedObjectives];
    }
  }

  meta.teamName =
    teams?.find((team) => team.id === scoreDiff.team_id)?.name || "";
  meta.userName = users?.find(
    (user) => user.id === scoreDiff.score.completions[0]?.user_id,
  )?.display_name;
  meta.finished = scoreDiff.score.completions[0]?.finished;
  meta.rank = scoreDiff.score.completions[0]?.rank;
  meta.points += scoreDiff.score.completions[0]?.points;
  return meta;
}

export type TeamScore = { [teamId: number]: Score };
export function points(score: Score): number {
  let points = score.bonus_points;
  for (const completion of score.completions) {
    points += completion.points;
  }
  return points;
}

export type ScoreObjective = Omit<Objective, "children"> & {
  team_score: TeamScore;
  children: ScoreObjective[];
};

export function isWinnable(category: ScoreObjective): boolean {
  if (
    category.scoring_presets.some(
      (preset) => preset.scoring_method === "BONUS_PER_COMPLETION",
    ) ||
    category.children.length === 0
  ) {
    return false;
  }
  for (const teamId in category.team_score) {
    if (isFinished(category.team_score[teamId])) {
      return false;
    }
  }
  return true;
}

export function hasEnded(objective: ScoreObjective, teamId?: number): boolean {
  if (!teamId) {
    return false;
  }
  if (
    objective.scoring_presets.some(
      (preset) => preset.scoring_method === "BONUS_PER_COMPLETION",
    )
  ) {
    const finishedObjectives = objective.children.filter((objective) =>
      isFinished(objective.team_score[teamId]),
    ).length;
    return finishedObjectives === objective.children.length;
  }
  for (const child of objective.children) {
    if (!isFinished(child.team_score[teamId])) {
      return false;
    }
  }
  return true;
}

export function canBeFinished(objective: ScoreObjective): boolean {
  return (
    objective.scoring_presets[0]?.scoring_method !==
      ScoringMethod.CHILD_NUMBER_SUM ||
    !objective.children.some(
      (child) => child.aggregation === AggregationType.MAXIMUM,
    )
  );
}
