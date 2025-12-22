import { oauthApi } from "@client/client";

export function redirectOauth(
  provider: "discord" | "twitch" | "poe",
  latestUrl: string,
): () => Promise<void | Window | null> {
  return () =>
    oauthApi
      .oauthRedirect(provider, latestUrl)
      .then((urlString) => window.open(urlString, "_self"));
}
