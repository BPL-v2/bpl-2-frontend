import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { OauthCard } from "../components/oauth-card";
import { userApi } from "../client/client";
import { TwitchFilled } from "../icons/twitch";
import { DiscordFilled } from "../icons/discord";
import { ThemePicker } from "../components/theme-picker";

export function SettingsPage() {
  const { user, setUser } = useContext(GlobalStateContext);
  // const [searchParams] = useSearchParams();
  // const { isMobile } = useContext(GlobalStateContext);
  // const [profileUserName, setProfileUserName] = useState<User | null>(null);
  // useEffect(() => {
  //   const tab = searchParams.get("user");
  //   if (tab) {
  //     setSelectedTab(tab);
  //   }
  // }, [searchParams]);

  if (!user) {
    return <></>;
  }

  return (
    <div>
      <ThemePicker />

      <div className="card bg-base-200 mt-4">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold">Profile</h2>
          <p className="text-left">
            You can change your username here. Your username will be used to
            display your score on the leaderboard.
          </p>
          <form
            className="flex"
            onSubmit={(e) => {
              e.preventDefault();
              userApi
                .updateUser({
                  display_name: new FormData(e.target as HTMLFormElement).get(
                    "display_name"
                  ) as string,
                })
                .then(setUser);
            }}
          >
            <div className="join gap-0 ">
              <input
                type="text"
                name="display_name"
                defaultValue={user.display_name}
                className="input rounded-l-field focus:border-r-transparent focus:outline-transparent"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 mb-4 justify-items-center">
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
