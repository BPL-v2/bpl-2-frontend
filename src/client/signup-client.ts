import { fetchWrapper } from "./base";
import { Signup } from "../types/signup";

export async function submitEventApplication(
  eventId: number,
  data: any
): Promise<Signup> {
  return fetchWrapper<Signup>("/events/" + eventId + "/signups/self", "PUT", {
    expected_playtime: data.playtime,
  });
}

export async function withdrawEventApplication(
  eventId: number
): Promise<Signup> {
  return fetchWrapper<Signup>("/events/" + eventId + "/signups/self", "DELETE");
}
