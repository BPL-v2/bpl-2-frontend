import { useRouterState } from "@tanstack/react-router";
import { redirectOauth } from "@utils/oauth";
import { useRemoveOauthProvider } from "@client/query";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { twMerge } from "tailwind-merge";

type OauthCardProps = {
  required?: boolean;
  connected: boolean;
  provider: "discord" | "twitch" | "poe";
  title: string;
  description: string;
  logo: React.ReactNode;
  allowDisconnect?: boolean;
};

export function OauthCard({
  required,
  provider,
  description,
  connected,
  title,
  logo,
  allowDisconnect = true,
}: OauthCardProps) {
  const state = useRouterState();
  const qc = useQueryClient();
  const { removeOauthProvider } = useRemoveOauthProvider(qc);
  const connectionButton = useMemo(() => {
    if (connected && !allowDisconnect) {
      return null;
    }
    if (!connected) {
      return (
        <button
          className={"btn btn-outline btn-success"}
          onClick={redirectOauth(provider, state.location.href)}
        >
          Connect
        </button>
      );
    }
    return (
      <button
        className={"btn btn-outline btn-error"}
        onClick={() => removeOauthProvider(provider)}
      >
        Disconnect
      </button>
    );
  }, [connected, allowDisconnect, provider]);

  const card = (
    <div
      className={twMerge(
        "max-size-110 card border-2",
        required ? "border-error" : "border-base-100",
        connected
          ? "border-success bg-base-300"
          : "border-base-300 bg-base-200",
      )}
    >
      <div
        className={twMerge(
          "flex items-center justify-between rounded-t-box px-8 py-4",
          connected ? "bg-base-200" : "bg-base-100",
        )}
      >
        <h1 className="text-center text-2xl font-bold">{title}</h1>
        {connectionButton}
      </div>
      <div className="card-body grid grid-cols-2 items-center gap-2 text-left text-lg">
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
