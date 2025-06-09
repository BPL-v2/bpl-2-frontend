import { Callback, OauthQueryParams } from "@components/callback";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/poe/callback")({
  component: RouteComponent,
  validateSearch: (search: Record<string, string>): OauthQueryParams => {
    return {
      state: search.state as string,
      code: search.code as string,
      error: search.error as string | undefined,
      error_description: search.error_description as string | undefined,
    };
  },
});

function RouteComponent() {
  const { state, code } = Route.useSearch();
  return <Callback state={state} code={code} provider="poe" />;
}
