import { useRouterState } from "@tanstack/react-router";
import { redirectOauth } from "@utils/oauth";
import { useRemoveOauthProvider } from "@client/query";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { twMerge } from "tailwind-merge";

type OauthCardProps = {
  required?: boolean;
  accountId?: string;
  accountName?: string;
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
  accountId,
  accountName,
  title,
  logo,
  allowDisconnect = true,
}: OauthCardProps) {
  const state = useRouterState();
  const qc = useQueryClient();
  const { removeOauthProvider } = useRemoveOauthProvider(qc);
  const connectionButton = useMemo(() => {
    if (accountName && !allowDisconnect) {
      return null;
    }
    if (!accountName) {
      return (
        <button
          className={"btn border-2 btn-outline btn-success"}
          onClick={redirectOauth(provider, state.location.href)}
        >
          Connect
        </button>
      );
    }
    return (
      <button
        className={"btn border-2 btn-outline btn-error"}
        onClick={() => removeOauthProvider(provider)}
      >
        Disconnect
      </button>
    );
  }, [accountName, allowDisconnect, provider]);

  const card = (
    <div
      className={twMerge(
        "card max-w-110 border-2 border-base-300 bg-gradient-to-t from-base-300 to-base-200 shadow-xl",
        required ? "border-error" : "",
        accountName ? "border-success" : "",
      )}
    >
      <div
        className={twMerge(
          "flex min-h-22 justify-between rounded-t-box border-b-2 border-base-300 px-8 py-4",
          accountName ? "bg-base-100/50" : "bg-base-200/50",
        )}
      >
        <div className="flex flex-col text-left">
          <h1 className="text-2xl font-bold">{title}</h1>
          {accountName && (
            <div className="tooltip tooltip-bottom" data-tip={accountId}>
              Connected as {accountName}
            </div>
          )}
        </div>
        {connectionButton}
      </div>
      <div className="card-body">
        <div className="grid grid-cols-2 gap-8 text-left text-lg">
          <div className={!accountName ? "grayscale" : ""}>{logo}</div>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
  if (!required || accountName) {
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
