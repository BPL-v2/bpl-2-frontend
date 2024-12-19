import {
  ScoringPreset,
  ScoringPresetCreate,
  ScoringPresetUpdate,
} from "../types/scoring-preset";
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

export async function createScoringPreset(data: ScoringPresetCreate) {
  return await fetchWrapper<ScoringPreset>(
    "/scoring/presets",
    "PUT",
    true,
    data
  );
}

export async function updateScoringPreset(data: ScoringPresetUpdate) {
  return await fetchWrapper<ScoringPreset>(
    "/scoring/presets",
    "PUT",
    true,
    data
  );
}
