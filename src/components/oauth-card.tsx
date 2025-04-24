import { useContext } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import { userApi } from "@client/client";
import { useRouterState } from "@tanstack/react-router";
import { redirectOauth } from "@utils/oauth";

type OauthCardProps = {
  required?: boolean;
  connected: boolean;
  provider: "discord" | "twitch" | "poe";
  title: string;
  description: string;
  logo: React.ReactNode;
};

export function OauthCard({
  required,
  provider,
  description,
  connected,
  title,
  logo,
}: OauthCardProps) {
  const { setUser } = useContext(GlobalStateContext);
  const state = useRouterState();
  const connectionButton = connected ? (
    <button
      className={`btn btn-error btn-outline`}
      onClick={() => userApi.removeAuth(provider).then(setUser)}
    >
      Disconnect
    </button>
  ) : (
    <button
      className={`btn btn-success btn-outline`}
      onClick={redirectOauth(provider, state.location.href)}
    >
      Connect
    </button>
  );

  const card = (
    <div
      className={`card border-2 max-h-100 max-w-120 ${connected ? "border-sucess" : required ? "border-error" : "border-base-100"} ${connected ? "bg-base-300" : "bg-base-200"}`}
    >
      <div
        className={`rounded-t-box px-8 py-4 items-center justify-between flex ${connected ? "bg-base-200" : "bg-base-100"}`}
      >
        <h1 className="text-2xl font-bold text-center">{title}</h1>
        {connectionButton}
      </div>
      <div className="card-body grid gap-2 grid-cols-2 items-center text-lg text-left">
        <div className={!connected ? "grayscale" : ""}>{logo}</div>
        <p>{description}</p>
      </div>
    </div>
  );
  if (!required || connected) {
    return card;
  }
  return (
    <div
      className="tooltip tooltip-error"
      data-tip="Connect your account to participate in the event"
    >
      {card}
    </div>
  );
}
