import { OauthCard } from "@components/oauth-card";
import { TwitchFilled } from "@icons/twitch";
import { DiscordFilled } from "@icons/discord";
import { ThemePicker } from "@components/theme-picker";
import { createFileRoute } from "@tanstack/react-router";
import { useChangeUserDisplayName, useGetUser } from "@client/query";
import { useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import { usePageSEO } from "@utils/use-seo";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

export function SettingsPage() {
  usePageSEO('settings');
  const qc = useQueryClient();
  const { user } = useGetUser();
  const { changeUserDisplayName } = useChangeUserDisplayName(qc);
  const { preferences, setPreferences } = useContext(GlobalStateContext);

  if (!user) {
    return <></>;
  }

  return (
    <div>
      <div className="card bg-base-200 mt-4">
        <div className="card-body">
          <fieldset className="fieldset bg-base-200 border-base-300  p-4">
            <legend className="fieldset-legend text-2xl font-bold text-left">
              Settings
            </legend>

            <label className="label text-lg">Your displayed username</label>
            <form
              className="flex"
              onSubmit={(e) => {
                e.preventDefault();
                changeUserDisplayName(e.currentTarget.display_name.value);
              }}
            >
              <div className="join gap-0 w-100">
                <input
                  type="text"
                  name="display_name"
                  defaultValue={user.display_name}
                  className="input rounded-l-field focus:border-r-transparent focus:outline-transparent w-full"
                  required
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-outline rounded-r-field"
                >
                  Save
                </button>
              </div>
            </form>

            <label className="label text-lg">Theme</label>
            <div className="flex flex-row gap-2">
              <ThemePicker />
            </div>
            <label className="label text-lg">
              Limit Shown Teams:{" "}
              {preferences.limitTeams ? preferences.limitTeams : "No Limit"}
              {" (we recommend 4-5)"}
            </label>
            <input
              type="range"
              className="range range-primary w-100"
              min={0}
              max={20}
              value={preferences.limitTeams}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  limitTeams: e.target.valueAsNumber,
                })
              }
            ></input>
          </fieldset>
        </div>
      </div>
      <div className="card bg-base-200 mt-4">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold">OAuth Accounts</h2>
          <div style={{ textAlign: "left" }}>
            <p>
              At least one account needs to stay connected at all times. When
              connecting, you might automatically be connecting with the account
              that you currently are logged into with your browser, so make sure
              it is the correct one.
            </p>
            <p style={{ fontWeight: "bold" }}>
              Both PoE and Discord accounts are required to participate in the
              event.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 mb-4 justify-items-center">
            <OauthCard
              title="Path of Exile"
              provider="poe"
              description="We need permission to request your Path of Exile character information on your behalf."
              connected={!!user?.account_name}
              required={true}
              logo={
                <img
                  src="/assets/app-logos/poe2.png"
                  alt="Path of Exile logo"
                />
              }
              allowDisconnect={false}
            ></OauthCard>
            <OauthCard
              title="Discord"
              provider="discord"
              description="We need your discord id to identify you in the discord server."
              connected={!!user?.discord_id}
              required={true}
              logo={<DiscordFilled className="text-[#5865f2]"></DiscordFilled>}
            ></OauthCard>
            <OauthCard
              title="Twitch"
              provider="twitch"
              description="If you connect your Twitch account, we will display your stream during the event."
              connected={!!user?.twitch_id}
              logo={<TwitchFilled className="text-[#9146ff]"></TwitchFilled>}
            ></OauthCard>
          </div>
        </div>
      </div>
    </div>
  );
}
