import { ScoreObjective } from "./score";
import { ScoringPreset } from "./scoring-preset";

export enum ObjectiveType {
  ITEM = "ITEM",
  PLAYER = "PLAYER",
  SUBMISSION = "SUBMISSION",
}

export enum AggregationType {
  SUM_LATEST = "SUM_LATEST",
  EARLIEST = "EARLIEST",
  EARLIEST_FRESH_ITEM = "EARLIEST_FRESH_ITEM",
  MAXIMUM = "MAXIMUM",
  MINIMUM = "MINIMUM",
}

export function availableAggregationTypes(
  objectiveType: ObjectiveType
): AggregationType[] {
  if (objectiveType === ObjectiveType.ITEM) {
    return Object.values(AggregationType);
  }
  return Object.values(AggregationType).filter(
    (type) => type !== AggregationType.EARLIEST_FRESH_ITEM
  );
}

export enum NumberField {
  STACK_SIZE = "STACK_SIZE",
  PLAYER_LEVEL = "PLAYER_LEVEL",
  PLAYER_XP = "PLAYER_XP",
  SUBMISSION_VALUE = "SUBMISSION_VALUE",
}

export function playerNumberfields(): NumberField[] {
  return [NumberField.PLAYER_LEVEL, NumberField.PLAYER_XP];
}

export enum Operator {
  EQ = "EQ",
  NEQ = "NEQ",
  GT = "GT",
  GTE = "GTE",
  LT = "LT",
  LTE = "LTE",
  IN = "IN",
  NOT_IN = "NOT_IN",
  MATCHES = "MATCHES",

  CONTAINS = "CONTAINS",
  CONTAINS_ALL = "CONTAINS_ALL",
  CONTAINS_MATCH = "CONTAINS_MATCH",
  CONTAINS_ALL_MATCHES = "CONTAINS_ALL_MATCHES",
}

export function operatorForField(field: ItemField): Operator[] {
  const numberOperators = [
    Operator.EQ,
    Operator.NEQ,
    Operator.GT,
    Operator.GTE,
    Operator.LT,
    Operator.LTE,
    Operator.IN,
    Operator.NOT_IN,
  ];
  const stringOperators = [
    Operator.EQ,
    Operator.NEQ,
    Operator.IN,
    Operator.NOT_IN,
    Operator.MATCHES,
  ];
  const stringArrayOperators = [
    Operator.CONTAINS,
    Operator.CONTAINS_ALL,
    Operator.CONTAINS_MATCH,
    Operator.CONTAINS_ALL_MATCHES,
  ];
  // const numberArrayOperators = [Operator.CONTAINS, Operator.CONTAINS_ALL];
  const booleanOperators = [Operator.EQ];

  switch (field) {
    case ItemField.BASE_TYPE:
      return stringOperators;
    case ItemField.NAME:
      return stringOperators;
    case ItemField.TYPE_LINE:
      return stringOperators;
    case ItemField.RARITY:
      return stringOperators;
    case ItemField.FRAME_TYPE:
      return numberOperators;
    case ItemField.TALISMAN_TIER:
      return numberOperators;
    case ItemField.EXPLICIT_MODS:
      return stringArrayOperators;
    case ItemField.IMPLICIT_MODS:
      return stringArrayOperators;
    case ItemField.CRAFTED_MODS:
      return stringArrayOperators;
    case ItemField.FRACTURED_MODS:
      return stringArrayOperators;
    case ItemField.ILVL:
      return numberOperators;
    case ItemField.SIX_LINK:
      return booleanOperators;
    case ItemField.ENCHANT_MODS:
      return stringArrayOperators;
    default:
      return [];
  }
}

export function operatorToString(operator: Operator): string {
  switch (operator) {
    case Operator.EQ:
      return "=";
    case Operator.NEQ:
      return "≠";
    case Operator.GT:
      return ">";
    case Operator.GTE:
      return "≥";
    case Operator.LT:
      return "<";
    case Operator.LTE:
      return "≤";
    case Operator.IN:
      return "in";
    case Operator.NOT_IN:
      return "not in";
    case Operator.MATCHES:
      return "matches";
    case Operator.CONTAINS:
      return "contains";
    case Operator.CONTAINS_ALL:
      return "contains all";
    case Operator.CONTAINS_MATCH:
      return "contains match";
    case Operator.CONTAINS_ALL_MATCHES:
      return "contains all matches";
  }
}

export enum ItemField {
  BASE_TYPE = "BASE_TYPE",
  NAME = "NAME",
  TYPE_LINE = "TYPE_LINE",
  RARITY = "RARITY",
  ILVL = "ILVL",
  FRAME_TYPE = "FRAME_TYPE",
  TALISMAN_TIER = "TALISMAN_TIER",
  ENCHANT_MODS = "ENCHANT_MODS",
  EXPLICIT_MODS = "EXPLICIT_MODS",
  IMPLICIT_MODS = "IMPLICIT_MODS",
  CRAFTED_MODS = "CRAFTED_MODS",
  FRACTURED_MODS = "FRACTURED_MODS",
  SIX_LINK = "SIX_LINK",
}

export type Condition = {
  id?: number;
  objective_id?: number;
  field: ItemField;
  operator: Operator;
  value: string;
};

export type ScoringObjective = {
  id: number;
  name: string;
  required_number: number;
  conditions: Condition[];
  category_id: number;
  objective_type: ObjectiveType;
  valid_from: string | null;
  valid_to: string | null;
  aggregation: AggregationType;
  number_field: NumberField;
  scoring_preset: ScoringPreset | null;
  scoring_preset_id: number | null;
};

export type ConditionCreate = {
  operator: Operator;
  field: ItemField;
  value: string;
};

export type ConditionUpdate = {
  operator?: Operator;
  field?: ItemField;
  value?: string;
};

export type ScoringObjectiveCreate = {
  id?: number;
  name: string;
  required_number: number;
  objective_type: ObjectiveType;
  valid_from: string | null;
  valid_to: string | null;
  conditions: ConditionCreate[];
  category_id: number;
  scoring_preset_id?: number;
  aggregation: AggregationType;
  number_field: NumberField;
};

export type ScoringObjectiveUpdate = {
  id: number;
  name: string;
  required_number: number;
  objective_type: ObjectiveType;
  valid_from?: string | null;
  valid_to?: string | null;
  category_id: number;
  scoring_id?: number;
};

export function getImage(
  objective: ScoreObjective | ScoringObjective
): string | null {
  if (objective.objective_type !== ObjectiveType.ITEM) {
    return null;
  }
  for (const condition of objective.conditions) {
    if (condition.field === ItemField.NAME) {
      return "/assets/uniques/" + condition.value.replaceAll(" ", "_") + ".png";
    }
  }
  return null;
}
