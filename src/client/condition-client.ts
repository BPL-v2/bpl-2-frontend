import { Condition } from "../types/scoring-objective";
import { fetchWrapper } from "./base";

export async function createCondition(
  objectiveId: number,
  data: Partial<Condition>
) {
  if (
    data.field === undefined ||
    data.operator === undefined ||
    data.value === undefined
  ) {
    return;
  }
  data.objective_id = objectiveId;

  return await fetchWrapper<Condition>("/scoring/conditions", "PUT", data);
}

export async function deleteCondition(data: Partial<Condition>) {
  console.log(data);
  if (data.id === undefined) {
    throw Error;
  }
  return await fetchWrapper("/scoring/conditions/" + data.id, "DELETE");
}
