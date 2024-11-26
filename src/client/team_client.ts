import type { Team, TeamCreate, TeamUpdate } from "../types/team";
import { fetchWrapper } from "./base";

export async function fetchTeamsForEvent(eventId: number): Promise<Team[]> {
  return await fetchWrapper<Team[]>("/events/" + eventId + "/teams", "GET");
}

export async function createTeam(
  eventId: number,
  data: Partial<Team>,
  token: string
) {
  if (data.name === undefined) {
    return;
  }
  if (data.allowed_classes) {
    data.allowed_classes = data.allowed_classes;
  }
  const body: TeamCreate = {
    name: data.name,
    allowed_classes: data.allowed_classes || [],
  };

  return await fetchWrapper<Team>(
    "/events/" + eventId + "/teams",
    "POST",
    token,
    body
  );
}

export async function updateTeam(
  eventId: number,
  data: Partial<Team>,
  token: string
) {
  if (data.id === undefined) {
    throw Error;
  }

  const body: TeamUpdate = {};
  if (data.name !== undefined) {
    body.name = data.name;
  }
  if (data.allowed_classes !== undefined) {
    body.allowed_classes == data.allowed_classes;
  }

  return await fetchWrapper<Team>(
    "/events/" + eventId + "/teams/" + data.id,
    "PATCH",
    token,
    body
  );
}

export async function deleteTeam(
  eventId: number,
  data: Partial<Team>,
  token: string
) {
  if (data.id === undefined) {
    throw Error;
  }
  return await fetchWrapper<null>(
    "/events/" + eventId + "/teams/" + data.id,
    "DELETE",
    token
  );
}
