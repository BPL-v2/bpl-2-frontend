import { oauthApi } from "@client/client";

export function redirectOauth(
  provider: "discord" | "twitch" | "poe",
  latestUrl: string
): () => Promise<void> {
  // hack to enable dynamic redirect uris depending on where the frontend is hosted
  return () =>
    oauthApi.oauthRedirect(provider, latestUrl).then((urlString) => {
      const url = new URL(urlString);
      let redirect_uri = window.location.origin;
      if (redirect_uri === "http://localhost") {
        redirect_uri = "https://redirectmeto.com/" + redirect_uri;
      }
      url.searchParams.set(
        "redirect_uri",
        redirect_uri + "/auth/" + provider + "/callback"
      );
      window.open(url, "_self");
    });
}
