import { User } from "../types/user";
import { fetchWrapper } from "./base";

export async function getUserInfo(): Promise<User> {
  return await fetchWrapper<User>("/users", "GET", true);
}

export async function logoutUser() {
  return await fetchWrapper("/users/logout", "POST", true);
}
