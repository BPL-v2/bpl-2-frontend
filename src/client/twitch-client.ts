import { TwitchStream } from "../types/twitch-stream";
import { fetchWrapper } from "./base";

export async function fetchStreams() {
  return await fetchWrapper<TwitchStream[]>("/streams", "GET");
}
