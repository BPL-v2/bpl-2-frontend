import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { userApi } from "../client/client";

type OauthCardProps = {
  required?: boolean;
  connected: boolean;
  provider: string;
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
      onClick={() => {
        window.open(
          import.meta.env.VITE_BACKEND_URL + "/oauth2/" + provider,
          ""
        );
      }}
    >
      Connect
    </button>
  );
  let borderColour = "border-base-100";
  if (connected) {
    borderColour = "border-success";
  } else if (required) {
    borderColour = "border-error";
  }
  const bodyColour = connected ? "bg-base-300" : "bg-base-200";
  const headerColour = connected ? "bg-base-200" : "bg-base-100";

  const card = (
    <div
      className={`card border-2 max-h-100 max-w-120 ${borderColour} ${bodyColour}`}
    >
      <div
        className={`rounded-t-box px-8 py-4 items-center justify-between flex ${headerColour}`}
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
