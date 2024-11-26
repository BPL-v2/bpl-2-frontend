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
  data: Partial<ScoringCategory>,
  token: string
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
    token,
    body
  );
}

export async function updateCategory(
  categoryId: number,
  data: Partial<ScoringCategory>,
  token: string
) {
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
    "/scoring-categories/" + categoryId,
    "PATCH",
    token,
    body
  );
}

export async function deleteCategory(
  data: Partial<ScoringCategory>,
  token: string
) {
  if (data.id === undefined) {
    throw Error;
  }
  return await fetchWrapper<null>(
    "/scoring-categories/" + data.id,
    "DELETE",
    token
  );
}
