import { oauthApi } from "@client/client";
import { useEffect } from "react";
import { router } from "../router";
import { getCallbackUrl } from "@utils/oauth";
import { useQueryClient } from "@tanstack/react-query";

type CallbackProps = {
  state: string;
  code: string;
  provider: "poe" | "discord" | "twitch";
};
export type OauthQueryParams = {
  state: string;
  code: string;
};

export function Callback({ state, code, provider }: CallbackProps) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!state || !code || !provider) {
      router.navigate({
        to: "/",
      });
      return;
    }
    oauthApi
      .oauthCallback(provider, {
        redirect_url: getCallbackUrl(provider),
        state: state,
        code: code,
      })
      .then((resp) => {
        localStorage.setItem("auth", resp.auth_token);
        queryClient.invalidateQueries({
          queryKey: ["user"],
        });
        router.navigate({
          to: resp.last_path,
        });
      });
  }, [state, code, provider]);
  return <h1>Handling Authentication...</h1>;
}
