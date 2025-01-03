import { MinimalUser, User, UserMapResponse } from "../types/user";
import { fetchWrapper } from "./base";

export async function getUserInfo(): Promise<User> {
  return await fetchWrapper<User>("/users/self", "GET");
}

export async function getAllUsers(): Promise<User[]> {
  return await fetchWrapper<User[]>("/users", "GET");
}

export async function logoutUser() {
  return await fetchWrapper("/users/logout", "POST");
}

export async function editUserPermissions(user: Partial<User>) {
  if (!user.permissions || !user.id) {
    return;
  }
  return await fetchWrapper("/users/" + user.id, "PATCH", user.permissions);
}

export async function fetchUsersForEvent(
  eventId: number
): Promise<MinimalUser[]> {
  return await fetchWrapper<UserMapResponse>(
    "/events/" + eventId + "/users",
    "GET"
  ).then((response) => {
    let users: MinimalUser[] = [];
    for (let teamId in response) {
      for (let user of response[teamId]) {
        users.push({ ...user, team_id: parseInt(teamId) });
      }
    }
    return users;
  });
}
