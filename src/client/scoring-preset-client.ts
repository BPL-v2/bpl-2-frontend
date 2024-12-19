import { ScoringPreset } from "../types/scoring-preset";
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
  if (data.points && typeof data.points === "string") {
    // @ts-ignore form returns string, but we need a number array
    data.points = data.points.split(",").map((x) => parseFloat(x));
  }
  data.event_id = eventId;
  return await fetchWrapper<ScoringPreset>(
    "/scoring/presets",
    "PUT",
    true,
    data
  );
}
