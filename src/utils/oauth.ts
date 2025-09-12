import { oauthApi } from "@client/client";

export function getCallbackUrl(provider: "discord" | "twitch" | "poe") {
  let callbackUrl = window.location.origin;
  if (callbackUrl.startsWith("http://localhost")) {
    // oauth providers require https
    callbackUrl = "https://redirectmeto.com/" + callbackUrl;
  }
  callbackUrl += "/auth/" + provider + "/callback";
  return callbackUrl;
}

export function redirectOauth(
  provider: "discord" | "twitch" | "poe",
  latestUrl: string
): () => Promise<void | Window | null> {
  return () =>
    oauthApi
      .oauthRedirect(provider, getCallbackUrl(provider), latestUrl)
      .then((urlString) => window.open(urlString, "_self"));
}
