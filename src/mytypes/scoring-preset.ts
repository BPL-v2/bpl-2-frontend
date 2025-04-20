import { ScoringMethod, ScoringPresetType } from "@client/api";

export function methodsForType(type: ScoringPresetType): ScoringMethod[] {
  switch (type) {
    case ScoringPresetType.OBJECTIVE:
      return [
        ScoringMethod.PRESENCE,
        ScoringMethod.POINTS_FROM_VALUE,
        ScoringMethod.RANKED_TIME,
        ScoringMethod.RANKED_VALUE,
        ScoringMethod.RANKED_REVERSE,
      ];
    case ScoringPresetType.CATEGORY:
      return [
        ScoringMethod.RANKED_COMPLETION_TIME,
        ScoringMethod.BONUS_PER_COMPLETION,
      ];
  }
}
