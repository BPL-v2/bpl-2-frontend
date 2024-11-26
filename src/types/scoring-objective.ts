export enum ObjectiveType {
  ITEM = "ITEM",
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
  objective_id: number;
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
  name: string;
  required_number: number;
  objective_type: ObjectiveType;
  valid_from: string | null;
  valid_to: string | null;
  conditions: ConditionCreate[];
};

export type ScoringObjectiveUpdate = {
  name?: string;
  required_number?: number;
  objective_type?: ObjectiveType;
  valid_from?: string | null;
  valid_to?: string | null;
  conditions?: ConditionUpdate[];
};
