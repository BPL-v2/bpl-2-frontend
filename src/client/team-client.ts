import type { Team } from "../types/team";
import { fetchWrapper } from "./base";

export async function fetchTeamsForEvent(eventId: number): Promise<Team[]> {
  return await fetchWrapper<Team[]>("/events/" + eventId + "/teams", "GET");
}

export async function createTeam(eventId: number, data: Partial<Team>) {
  if (data.name === undefined) {
    return;
  }
  if (
    data.allowed_classes === undefined ||
    data.allowed_classes.length === 0 ||
    data.allowed_classes === null
  ) {
    data.allowed_classes = [];
  }
  return await fetchWrapper<Team>("/events/" + eventId + "/teams", "PUT", data);
}

export async function deleteTeam(eventId: number, data: Partial<Team>) {
  if (data.id === undefined) {
    throw Error;
  }
  return await fetchWrapper<null>(
    "/events/" + eventId + "/teams/" + data.id,
    "DELETE"
  );
}
