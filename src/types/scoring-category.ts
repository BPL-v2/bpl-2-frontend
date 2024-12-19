import { ScoringObjective } from "./scoring-objective";
import { ScoringPreset } from "./scoring-preset";

export type ScoringCategory = {
  id: number;
  name: string;
  sub_categories: ScoringCategory[];
  objectives: ScoringObjective[];
  scoring_preset: ScoringPreset | null;
  scoring_preset_id: number | undefined;
  parent_id: number;
};

export type CategoryCreate = {
  id?: number;
  name: string;
  parent_id: number;
  scoring_preset_id?: number;
};
