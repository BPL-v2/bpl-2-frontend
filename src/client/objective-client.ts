import {
  ItemField,
  NumberField,
  ObjectiveType,
  Operator,
  ScoringObjective,
} from "../types/scoring-objective";
import { fetchWrapper } from "./base";

export async function getObjectiveById(
  objectiveId: number
): Promise<ScoringObjective> {
  return await fetchWrapper<ScoringObjective>(
    "/scoring/objectives/" + objectiveId,
    "GET"
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
  if (!data.scoring_preset_id) {
    delete data.scoring_preset_id;
  }
  data.category_id = categoryId;
  return await fetchWrapper<Partial<ScoringObjective>>(
    "/scoring/objectives",
    "PUT",
    data
  );
}
export async function createBulkItemObjectives(
  categoryId: number,
  nameList: string,
  scoring_preset_id: number,
  aggregation_method: string,
  field: ItemField
) {
  const objectives = nameList.split(",").map((name) => {
    return {
      name: name.trim(),
      required_number: 1,
      objective_type: ObjectiveType.ITEM,
      aggregation: aggregation_method,
      number_field: NumberField.STACK_SIZE,
      scoring_preset_id: scoring_preset_id,
      category_id: categoryId,
      conditions: [
        {
          field: field,
          operator: Operator.EQ,
          value: name,
        },
      ],
    };
  });
  await Promise.all(
    objectives.map(async (objective) => {
      return fetchWrapper<Partial<ScoringObjective>>(
        "/scoring/objectives",
        "PUT",
        objective
      );
    })
  );
}

export async function deleteObjective(data: Partial<ScoringObjective>) {
  if (data.id === undefined) {
    throw Error;
  }
  return await fetchWrapper<null>("/scoring/objectives/" + data.id, "DELETE");
}
