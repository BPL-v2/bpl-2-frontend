import { oauthApi } from "@client/client";
import { useEffect } from "react";
import { router } from "../router";
import { getCallbackUrl } from "@utils/oauth";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

type CallbackProps = {
  state: string;
  code: string;
  error?: string;
  error_description?: string;
  provider: "poe" | "discord" | "twitch";
};
export type OauthQueryParams = {
  state: string;
  code: string;
  error?: string;
  error_description?: string;
};

export function Callback({
  state,
  code,
  error,
  error_description,
  provider,
}: CallbackProps) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (error) {
      return;
    }
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
  }, [state, code, provider, error]);
  if (error) {
    return (
      <>
        <h1 className="text-3xl font-bold text-center text-error">
          Error: {error} - {error_description}
        </h1>
        <Link to="/" className="btn btn-primary mt-4">
          Return to home page
        </Link>
      </>
    );
  }

  return <h1>Handling Authentication...</h1>;
}
