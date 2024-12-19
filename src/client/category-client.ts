import { CategoryCreate, ScoringCategory } from "../types/scoring-category";
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
  console.log(data);
  data.parent_id = parentId;
  return await fetchWrapper<ScoringCategory>(
    "/scoring/categories",
    "PUT",
    true,
    data
  );
}

export async function updateCategory(data: Partial<ScoringCategory>) {
  if (
    data.id === undefined ||
    data.name === undefined ||
    data.parent_id === undefined
  ) {
    throw Error;
  }

  const body: CategoryCreate = {
    id: data.id,
    name: data.name,
    parent_id: data.parent_id,
  };
  if (data.scoring_preset) {
    // @ts-ignore: this doesnt quite fit the model. we are only sending the id not the whole object
    body.scoring_id = Number(data.scoring_preset);
  }
  console.log(body);
  return await fetchWrapper<ScoringCategory>(
    "/scoring/categories",
    "PUT",
    true,
    body
  );
}

export async function deleteCategory(data: Partial<ScoringCategory>) {
  if (data.id === undefined) {
    throw Error;
  }
  return await fetchWrapper<null>(
    "/scoring/categories/" + data.id,
    "DELETE",
    true
  );
}
