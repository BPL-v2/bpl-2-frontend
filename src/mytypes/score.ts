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
          objective.team_score[scoreDiff.team_id].isFinished(),
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

export class ScoreClass {
  score: Score;
  constructor(score: Score) {
    this.score = score;
  }

  totalPoints(): number {
    if (!this.score) {
      return 0;
    }
    let points = this.score.bonus_points;
    for (const completion of this.score.completions) {
      points += completion.points;
    }
    return points;
  }

  number(): number {
    if (!this.score) {
      return 0;
    }
    return this.score.completions[0]?.number || 0;
  }

  maxNumber(): number {
    if (!this.score) {
      return 0;
    }
    let max = 0;
    for (const completion of this.score.completions) {
      if (completion.number > max) {
        max = completion.number;
      }
    }
    return max;
  }

  isFinished(): boolean {
    if (!this.score) {
      return false;
    }
    return this.score.completions.every((completion) => completion.finished);
  }

  rank(): number {
    if (!this.score || this.score.completions.length === 0) {
      return 0;
    }
    return this.score.completions[0]?.rank || 0;
  }

  userId(): number | undefined {
    if (!this.score || this.score.completions.length === 0) {
      return;
    }
    for (const completion of this.score.completions) {
      if (completion.user_id) {
        return completion.user_id;
      }
    }
  }

  lastTimestamp(): number {
    let timestamp = 0;
    for (const completion of this.score?.completions || []) {
      if (completion.timestamp > timestamp) {
        timestamp = completion.timestamp;
      }
    }
    return timestamp;
  }
}

export type TeamScore = { [teamId: number]: ScoreClass };

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
    if (category.team_score[teamId].isFinished()) {
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
      objective.team_score[teamId].isFinished(),
    ).length;
    return finishedObjectives === objective.children.length;
  }
  for (const child of objective.children) {
    if (!child.team_score[teamId].isFinished()) {
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
