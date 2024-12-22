import { ScoringCategory } from "../types/scoring-category";
import { fetchWrapper } from "./base";

export async function fetchCategoryForEvent(
  eventId: number
): Promise<ScoringCategory> {
  return await fetchWrapper<ScoringCategory>(
    "/events/" + eventId + "/rules",
    "GET"
  );
}

export async function fetchCategoryById(
  categoryId: number
): Promise<ScoringCategory> {
  return await fetchWrapper<ScoringCategory>(
    "/scoring/categories/" + categoryId,
    "GET"
  );
}

export async function createScoringCategory(
  parentId: number,
  data: Partial<ScoringCategory>
) {
  if (!data.scoring_preset_id) {
    delete data.scoring_preset_id;
  }
  data.parent_id = parentId;
  return await fetchWrapper<ScoringCategory>(
    "/scoring/categories",
    "PUT",
    data
  );
}

export async function deleteCategory(data: Partial<ScoringCategory>) {
  if (data.id === undefined) {
    throw Error;
  }
  return await fetchWrapper<null>("/scoring/categories/" + data.id, "DELETE");
}
