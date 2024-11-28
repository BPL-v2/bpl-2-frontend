import {
  CategoryCreate,
  CategoryUpdate,
  ScoringCategory,
} from "../types/scoring-category";
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
    "/scoring-categories/" + categoryId,
    "GET"
  );
}

export async function createScoringCategory(
  parentId: number,
  data: Partial<ScoringCategory>
) {
  if (data.name === undefined) {
    return;
  }

  const body: CategoryCreate = {
    name: data.name,
    inheritance: data.inheritance,
  };

  return await fetchWrapper<ScoringCategory>(
    "/scoring-categories/" + parentId,
    "POST",
    true,
    body
  );
}

export async function updateCategory(data: Partial<ScoringCategory>) {
  if (data.id === undefined) {
    throw Error;
  }

  const body: CategoryUpdate = {};
  if (data.name !== undefined) {
    body.name = data.name;
  }
  if (data.inheritance !== undefined) {
    body.inheritance = data.inheritance;
  }

  return await fetchWrapper<ScoringCategory>(
    "/scoring-categories/" + data.id,
    "PATCH",
    true,
    body
  );
}

export async function deleteCategory(data: Partial<ScoringCategory>) {
  if (data.id === undefined) {
    throw Error;
  }
  return await fetchWrapper<null>(
    "/scoring-categories/" + data.id,
    "DELETE",
    true
  );
}
