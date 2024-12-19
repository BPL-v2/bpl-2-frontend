import { ScoringObjective } from "../types/scoring-objective";
import { fetchWrapper } from "./base";

export async function getObjectiveById(
  objectiveId: number
): Promise<ScoringObjective> {
  return await fetchWrapper<ScoringObjective>(
    "/scoring/objectives/" + objectiveId,
    "GET",
    true
  );
}

export async function createObjective(
  categoryId: number,
  data: Partial<ScoringObjective>
) {
  if (
    data.name === undefined ||
    data.objective_type === undefined ||
    data.aggregation === undefined ||
    data.number_field === undefined
  ) {
    return;
  }
  data.category_id = categoryId;
  return await fetchWrapper<Partial<ScoringObjective>>(
    "/scoring/objectives",
    "PUT",
    true,
    data
  );
}

export async function updateObjective(data: Partial<ScoringObjective>) {
  if (data.id === undefined) {
    throw Error;
  }

  return await fetchWrapper<ScoringObjective>(
    "/scoring/objectives",
    "PUT",
    true,
    data
  );
}

export async function deleteObjective(data: Partial<ScoringObjective>) {
  if (data.id === undefined) {
    throw Error;
  }
  return await fetchWrapper<null>(
    "/scoring/objectives/" + data.id,
    "DELETE",
    true
  );
}
