import { Provider } from "@client/api";
import { oauthApi, userApi } from "@client/client";
import { createFileRoute } from "@tanstack/react-router";
import { useContext, useEffect } from "react";
import { router } from "../router";
import { GlobalStateContext } from "@utils/context-provider";

type OauthQueryParams = {
  state: string;
  code: string;
  provider: string;
};

export const Route = createFileRoute("/redirect")({
  component: RouteComponent,
  validateSearch: (search: Record<string, string>): OauthQueryParams => {
    return {
      state: search.state as string,
      code: search.code as string,
      provider: search.provider as string,
    };
  },
});

function RouteComponent() {
  const { setUser } = useContext(GlobalStateContext);
  const { state, code, provider } = Route.useSearch();
  useEffect(() => {
    if (!state || !code || !provider) {
      router.navigate({
        to: "/",
      });
      return;
    }
    oauthApi
      .oauthCallback({
        state: state,
        code: code,
        provider: provider as Provider,
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
