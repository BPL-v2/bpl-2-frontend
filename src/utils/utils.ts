import {
  AggregationType,
  Objective,
  Score,
  ScoringMethod,
  ScoringPreset,
} from "@client/api";
import { ScoreObjective } from "@mytypes/score";

type TeamScores = { [teamId: number]: Score };

export type ScoreMap = { [teamId: number]: { [objectiveId: number]: Score } };

function getEmptyScore(): Score {
  return {
    points: 0,
    user_id: 0,
    rank: 0,
    timestamp: new Date().getTime() / 1000,
    number: 0,
    finished: false,
  };
}

export function mergeScores(
  objective: Objective,
  scores: ScoreMap,
  teamsIds: number[],
  scoringPresets: Record<number, ScoringPreset>,
): ScoreObjective {
  return {
    ...objective,
    scoring_preset: objective.scoring_preset_id
      ? scoringPresets[objective.scoring_preset_id]
      : undefined,
    children: objective.children.map((subObjective) =>
      mergeScores(subObjective, scores, teamsIds, scoringPresets),
    ),
    team_score: teamsIds.reduce((acc: TeamScores, teamId) => {
      acc[teamId] = scores[teamId]?.[objective.id] || getEmptyScore();
      return acc;
    }, {}),
  };
}

// todo: do this in a better way
export function hidePOTotal(score: ScoreObjective): ScoreObjective {
  for (const child of score.children) {
    if (child.name === "Personal Objectives") {
      const firstCheckpoint = child.children.sort(
        (a, b) =>
          new Date(a.valid_to!).getTime() - new Date(b.valid_to!).getTime(),
      )[0];
      for (const childChild of child.children) {
        if (
          childChild.aggregation === AggregationType.MAXIMUM &&
          Date.now() < new Date(firstCheckpoint.valid_to!).getTime()
        ) {
          childChild.team_score = Object.fromEntries(
            Object.entries(childChild.team_score).map(([teamId, score]) => [
              parseInt(teamId),
              {
                ...score,
                points: 0,
                number: 0,
              },
            ]),
          );
        }
      }
    }
  }

  return score;
}

export function getTotalPoints(objective?: ScoreObjective): {
  [teamId: number]: number;
} {
  if (!objective) {
    return {};
  }
  const points: { [teamId: number]: number } = {};
  for (const [teamId, teamScore] of Object.entries(objective.team_score)) {
    points[parseInt(teamId)] = teamScore.points;
  }
  for (const child of objective.children) {
    const childPoints = getTotalPoints(child);
    for (const [teamId, teamPoints] of Object.entries(childPoints)) {
      points[parseInt(teamId)] += teamPoints;
    }
  }
  return points;
}

type PotentialPoints = { [teamId: number]: number };

export function getPotentialPoints(objective: ScoreObjective): PotentialPoints {
  const points = getPotentialPointsForScoringMethod(objective);
  for (const child of objective.children) {
    const childPoints = getPotentialPoints(child);
    for (const [teamId, teamPoints] of Object.entries(childPoints)) {
      if (!points[parseInt(teamId)]) {
        points[parseInt(teamId)] = 0;
      }
      points[parseInt(teamId)] += teamPoints;
    }
  }
  return points;
}

function getPotentialPointsForScoringMethod(
  objective: ScoreObjective,
): PotentialPoints {
  switch (objective.scoring_preset?.scoring_method) {
    case ScoringMethod.PRESENCE:
      return potentialPointsPresence(objective);
    case ScoringMethod.RANKED_COMPLETION_TIME:
      return getPotentialPointsRanked(objective);
    case ScoringMethod.RANKED_TIME:
      return getPotentialPointsRanked(objective);
    case ScoringMethod.RANKED_REVERSE:
      return getPotentialPointsRanked(objective);
    case ScoringMethod.RANKED_VALUE:
      return getPotentialPointsRanked(objective);
    case ScoringMethod.POINTS_FROM_VALUE:
      return getPotentialPointsValue(objective);
    case ScoringMethod.BONUS_PER_COMPLETION:
      return getPotentialBonusPointsPerChild(objective);
    case ScoringMethod.BINGO_BOARD:
      return getPotentialPointsRanked(objective);
    default:
      return {};
  }
}

export function potentialPointsPresence(
  objective: ScoreObjective,
): PotentialPoints {
  const presencePoints = objective.scoring_preset!.points[0];
  return Object.keys(objective.team_score).reduce((acc, team_id) => {
    acc[parseInt(team_id)] = presencePoints;
    return acc;
  }, {} as PotentialPoints);
}

export function getPotentialPointsValue(
  objective: ScoreObjective,
): PotentialPoints {
  const maximum = objective.scoring_preset!.point_cap!;
  return Object.keys(objective.team_score).reduce((acc, team_id) => {
    acc[parseInt(team_id)] = maximum;
    return acc;
  }, {} as PotentialPoints);
}

export function getPotentialPointsRanked(
  objective: ScoreObjective,
): PotentialPoints {
  let rankPossible = 0;
  for (const teamScore of Object.values(objective.team_score)) {
    if (teamScore.finished) {
      rankPossible += 1;
    }
  }
  const presetPoints = objective.scoring_preset!.points;
  const possiblePointsForFinishing =
    rankPossible < presetPoints.length
      ? presetPoints[rankPossible]
      : presetPoints[presetPoints.length - 1];
  return Object.entries(objective.team_score).reduce(
    (acc, [team_id, score]) => {
      acc[parseInt(team_id)] = score.finished
        ? score.points
        : possiblePointsForFinishing;
      return acc;
    },
    {} as PotentialPoints,
  );
}

function getPotentialBonusPointsPerChild(
  objective: ScoreObjective,
): PotentialPoints {
  const presetPoints = objective.scoring_preset!.points;
  const childCount = objective.children.filter(
    (child) => child.children.length === 0,
  ).length;
  let potential = 0;
  for (let i = 0; i < childCount; i++) {
    potential +=
      i < presetPoints.length
        ? presetPoints[i]
        : presetPoints[presetPoints.length - 1];
  }
  return Object.keys(objective.team_score).reduce((acc, team_id) => {
    acc[parseInt(team_id)] = potential;
    return acc;
  }, {} as PotentialPoints);
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

export function flatMap<T extends Objective | ScoreObjective>(
  objective?: T,
): T[] {
  if (!objective) return [];
  const objectives: T[] = [objective];
  for (const child of objective.children) {
    objectives.push(...flatMap(child as T));
  }
  return objectives;
}

export type ExtendedScoreObjective = ScoreObjective & {
  isVariant?: boolean;
};

export function flatMapUniques(objective: ScoreObjective): ScoreObjective[] {
  const flatObjs: ScoreObjective[] = [];
  if (objective.children.length === 0) {
    flatObjs.push(objective);
  } else if (!objective.name.includes("Variants")) {
    for (const child of objective.children) {
      flatObjs.push(...flatMapUniques(child));
    }
  }
  return flatObjs;
}

export function getVariantMap(objective: ScoreObjective): {
  [objectiveName: string]: ScoreObjective[];
} {
  return objective.children.reduce(
    (acc, child) => {
      if (child.children.length > 0) {
        acc[child.name] = child.children;
      }
      return acc;
    },
    {} as { [objectiveName: string]: ScoreObjective[] },
  );
}

export function iterateObjectives(
  objective: ScoreObjective | Objective | undefined,
  callback: (obj: ScoreObjective | Objective) => void,
): void {
  if (!objective) {
    return;
  }
  callback(objective);
  for (const child of objective.children) {
    iterateObjectives(child, callback);
  }
}

export function findObjective(
  objective: ScoreObjective | Objective | undefined,
  finder: (objective: ScoreObjective | Objective) => boolean,
): ScoreObjective | Objective | undefined {
  if (!objective) {
    return;
  }
  if (finder(objective)) {
    return objective;
  }
  for (const child of objective.children) {
    const result = findObjective(child, finder);
    if (result) {
      return result;
    }
  }
}

export function getPath(
  objective: ScoreObjective | Objective | undefined,
  childId: number,
  path: number[] = [],
): number[] {
  if (!objective) {
    return [];
  }
  if (objective.id === childId) {
    return [...path, objective.id];
  }
  for (const child of objective.children) {
    const result = getPath(child, childId, [...path, objective.id]);
    if (result.includes(childId)) {
      return result;
    }
  }
  return [];
}

export function timeSort<T, K extends keyof T>(
  timefield: K,
  direction: "asc" | "desc",
): (a: T & Record<K, string>, b: T & Record<K, string>) => number {
  return (a, b) => {
    const timeA = new Date(a[timefield]).getTime();
    const timeB = new Date(b[timefield]).getTime();
    return direction === "asc" ? timeA - timeB : timeB - timeA;
  };
}
