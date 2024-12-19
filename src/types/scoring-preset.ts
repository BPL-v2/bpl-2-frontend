export enum ScoringPresetType {
  OBJECTIVE = "OBJECTIVE",
  CATEGORY = "CATEGORY",
}

export enum ScoringMethod {
  PRESENCE = "PRESENCE",
  POINTS_FROM_VALUE = "POINTS_FROM_VALUE",
  RANKED_TIME = "RANKED_TIME",
  RANKED_VALUE = "RANKED_VALUE",
  RANKED_REVERSE = "RANKED_REVERSE",
  RELATIVE_PRESENCE = "RELATIVE_PRESENCE",

  RANKED_COMPLETION_TIME = "RANKED_COMPLETION_TIME",
  BONUS_PER_COMPLETION = "BONUS_PER_COMPLETION",
}

export function methodsForType(type: ScoringPresetType): ScoringMethod[] {
  switch (type) {
    case ScoringPresetType.OBJECTIVE:
      return [
        ScoringMethod.PRESENCE,
        ScoringMethod.POINTS_FROM_VALUE,
        ScoringMethod.RANKED_TIME,
        ScoringMethod.RANKED_VALUE,
        ScoringMethod.RANKED_REVERSE,
        ScoringMethod.RELATIVE_PRESENCE,
      ];
    case ScoringPresetType.CATEGORY:
      return [
        ScoringMethod.RANKED_COMPLETION_TIME,
        ScoringMethod.BONUS_PER_COMPLETION,
      ];
  }
}

export type ScoringPreset = {
  id: number;
  name: string;
  description: string;
  points: number[];
  scoring_method: ScoringMethod;
  type: ScoringPresetType;
  event_id?: number;
};

export type ScoringPresetCreate = {
  name: string;
  description: string;
  points: number;
  scoring_method: ScoringMethod;
  type: ScoringPresetType;
};

export type ScoringPresetUpdate = {
  id: number;
  name: string;
  description: string;
  points: number;
  scoring_method: ScoringMethod;
  type: ScoringPresetType;
};
