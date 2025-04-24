import { oauthApi, userApi } from "@client/client";
import { useContext, useEffect } from "react";
import { router } from "../router";
import { GlobalStateContext } from "@utils/context-provider";

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
  const { setUser } = useContext(GlobalStateContext);
  useEffect(() => {
    if (!state || !code || !provider) {
      router.navigate({
        to: "/",
      });
      return;
    }
    oauthApi
      .oauthCallback(provider, {
        state: state,
        code: code,
      })
      .then((resp) => {
        localStorage.setItem("auth", resp.auth_token);
        userApi.getUser().then((data) => {
          setUser(data);
        });
        router.navigate({
          to: resp.last_path,
        });
      });
  }, [state, code, provider]);
  return <h1>Handling Authentication...</h1>;
}
