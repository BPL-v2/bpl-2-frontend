import { ScoreCategory } from "./score";
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

export function getObjectives(category: ScoringCategory): ScoringObjective[] {
  let objectives: ScoringObjective[] = [];
  for (const sub_category of category.sub_categories) {
    objectives = objectives.concat(getObjectives(sub_category));
  }
  return objectives.concat(category.objectives);
}

export function getSubCategory(
  category: ScoreCategory | undefined,
  subCategoryName: string
): ScoreCategory | undefined {
  if (!category) {
    return undefined;
  }
  if (category.name === subCategoryName) {
    return category;
  }
  for (const sub_category of category.sub_categories) {
    const result = getSubCategory(sub_category, subCategoryName);
    if (result) {
      return result;
    }
  }
  return undefined;
}

export function getRootCategoryNames(gameVersion: "poe1" | "poe2"): string[] {
  if (gameVersion === "poe1") {
    return [
      "Uniques",
      "Races",
      "Bounties",
      "Collections",
      "Dailies",
      "Heist",
      "Gems",
    ];
  }
  return ["Uniques", "Races", "Bounties", "Collections", "Dailies"];
}
