import { Category, Objective } from "@client/api";
import { ScoreCategory } from "./score";

export function getObjectives(category: Category): Objective[] {
  let objectives: Objective[] = [];
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
      "Personal Objectives",
      "Uniques",
      "Races",
      "Bounties",
      "Collections",
      "Dailies",
      "Heist",
      "Gems",
      "Delve",
    ];
  }
  return [
    "Personal Objectives",
    "Uniques",
    "Races",
    "Bounties",
    "Collections",
    "Dailies",
  ];
}

export function flattenCategories(category: ScoreCategory): ScoreCategory[] {
  let categories = [category];
  for (const sub_category of category.sub_categories) {
    categories = categories.concat(flattenCategories(sub_category));
  }
  return categories;
}
