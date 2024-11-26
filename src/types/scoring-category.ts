import { ScoringObjective } from "./scoring-objective";

export enum ScoringMethodType {
  PRESENCE = "PRESENCE",
  RANKED = "RANKED",
  RELATIVE_PRESENCE = "RELATIVE_PRESENCE",
}

export enum ScoringMethodInheritance {
  OVERWRITE = "OVERWRITE",
  INHERIT = "INHERIT",
  EXTEND = "EXTEND",
}

export type ScoringMethod = {
  category_id: number;
  type: ScoringMethodType;
  points: number[];
};

export type ScoringCategory = {
  id: number;
  name: string;
  inheritance: ScoringMethodInheritance;
  sub_categories: ScoringCategory[];
  objectives: ScoringObjective[];
  scoring_methods: ScoringMethod[];
};

export type CategoryCreate = {
  name: string;
  inheritance?: ScoringMethodInheritance;
};

export type CategoryUpdate = {
  name?: string;
  inheritance?: ScoringMethodInheritance;
};
