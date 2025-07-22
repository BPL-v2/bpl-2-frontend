import { MinimalUser, Objective, Score, ScoreDiff, Team } from "@client/api";
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
  teams?: Team[]
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
    if (
      meta.parent &&
      meta.parent.scoring_preset?.scoring_method === "BONUS_PER_COMPLETION"
    ) {
      const finishedObjectives = Math.min(
        meta.parent.children.filter(
          (objective) => objective.team_score[scoreDiff.team_id].finished
        ).length,
        meta.parent.scoring_preset.points.length - 1
      );
      meta.points += meta.parent.scoring_preset.points[finishedObjectives];
    }
  }

  meta.teamName =
    teams?.find((team) => team.id === scoreDiff.team_id)?.name || "";
  meta.userName = users?.find(
    (user) => user.id === scoreDiff.score.user_id
  )?.display_name;
  meta.finished = scoreDiff.score.finished;
  meta.rank = scoreDiff.score.rank;
  meta.points += scoreDiff.score.points;
  return meta;
}

export type TeamScore = { [teamId: number]: Score };

export type ScoreObjective = Omit<Objective, "children"> & {
  team_score: TeamScore;
  children: ScoreObjective[];
};

export function isWinnable(category: ScoreObjective): boolean {
  if (
    category.scoring_preset?.scoring_method === "BONUS_PER_COMPLETION" ||
    category.children.length === 0
  ) {
    return false;
  }
  for (const teamId in category.team_score) {
    if (category.team_score[teamId].finished) {
      return false;
    }
  }
  return true;
}

export function isFinished(objective: ScoreObjective, teamId: number): boolean {
  if (objective.scoring_preset?.scoring_method === "BONUS_PER_COMPLETION") {
    const finishedObjectives = objective.children.filter(
      (objective) => objective.team_score[teamId].finished
    ).length;
    return finishedObjectives === objective.children.length;
  }
  for (const child of objective.children) {
    if (!child.team_score[teamId].finished) {
      return false;
    }
  }
  return true;
}
