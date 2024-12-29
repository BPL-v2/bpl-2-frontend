import { methodsForType, ScoringPreset } from "../types/scoring-preset";
import { fetchWrapper } from "./base";

export async function fetchScoringPresetsForEvent(
  eventId: number
): Promise<ScoringPreset[]> {
  return await fetchWrapper<ScoringPreset[]>(
    "/events/" + eventId + "/scoring-presets",
    "GET"
  );
}

export async function fetchScoringPresetById(
  presetId: number
): Promise<ScoringPreset> {
  return await fetchWrapper<ScoringPreset>(
    "/scoring/presets/" + presetId,
    "GET"
  );
}

export async function createScoringPreset(
  eventId: number,
  data: Partial<ScoringPreset>
): Promise<ScoringPreset> {
  if (!data.type || !data.scoring_method) {
    throw new Error("Missing required fields");
  }

  if (!methodsForType(data.type).includes(data.scoring_method)) {
    throw new Error(
      "Invalid method for type " +
        data.type +
        ": " +
        data.scoring_method +
        ". Valid methods are: " +
        methodsForType(data.type).join(", ")
    );
  }
  if (data.points && typeof data.points === "string") {
    // @ts-ignore form returns string, but we need a number array
    data.points = data.points.split(",").map((x) => parseFloat(x));
  }
  data.event_id = eventId;

  try {
    const response = await fetchWrapper<ScoringPreset>(
      "/scoring/presets",
      "PUT",
      data
    );
    return response;
  } catch (error) {
    console.error("Error in fetchWrapper:", error);
    throw error;
  }
}
