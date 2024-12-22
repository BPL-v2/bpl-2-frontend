import { User } from "../types/user";
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
