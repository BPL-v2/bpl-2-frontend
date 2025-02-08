import { Form, FormInstance, Input } from "antd";
import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { updateUser } from "../client/user-client";
import React from "react";
import { OauthCard } from "../components/oauth-card";

export function ProfilePage() {
  const { user, setUser } = useContext(GlobalStateContext);
  const formRef = React.useRef<FormInstance>(null);
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
      <div className="card bg-base-200 mt-4">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold">Profile</h2>
          <p className="text-left">
            You can change your username here. Your username will be used to
            display your score on the leaderboard.
          </p>
          <Form
            onFinish={(value) => updateUser(value.display_name).then(setUser)}
            ref={formRef}
          >
            <Form.Item
              label="Username"
              name="display_name"
              rules={[{ required: true, message: "Please input a username!" }]}
              initialValue={user?.display_name}
              style={{ width: "400px" }}
            >
              <Input />
            </Form.Item>
          </Form>
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
              logo={
                <svg
                  fillRule="evenodd"
                  viewBox="64 64 896 896"
                  width="100%"
                  height="100%"
                  fill="#5865f2"
                  aria-hidden="true"
                >
                  <path d="M811.15 87c51.16 0 92.41 41.36 94.85 90.03V960l-97.4-82.68-53.48-48.67-58.35-50.85 24.37 80.2H210.41c-51 0-92.41-38.74-92.41-90.06V177.21c0-48.67 41.48-90.1 92.6-90.1h600.3zM588.16 294.1h-1.09l-7.34 7.28c75.38 21.8 111.85 55.86 111.85 55.86-48.58-24.28-92.36-36.42-136.14-41.32-31.64-4.91-63.28-2.33-90 0h-7.28c-17.09 0-53.45 7.27-102.18 26.7-16.98 7.39-26.72 12.22-26.72 12.22s36.43-36.42 116.72-55.86l-4.9-4.9s-60.8-2.33-126.44 46.15c0 0-65.64 114.26-65.64 255.13 0 0 36.36 63.24 136.11 65.64 0 0 14.55-19.37 29.27-36.42-56-17-77.82-51.02-77.82-51.02s4.88 2.4 12.19 7.27h2.18c1.09 0 1.6.54 2.18 1.09v.21c.58.59 1.09 1.1 2.18 1.1 12 4.94 24 9.8 33.82 14.53a297.58 297.58 0 0065.45 19.48c33.82 4.9 72.59 7.27 116.73 0 21.82-4.9 43.64-9.7 65.46-19.44 14.18-7.27 31.63-14.54 50.8-26.79 0 0-21.82 34.02-80.19 51.03 12 16.94 28.91 36.34 28.91 36.34 99.79-2.18 138.55-65.42 140.73-62.73 0-140.65-66-255.13-66-255.13-59.45-44.12-115.09-45.8-124.91-45.8l2.04-.72zM595 454c25.46 0 46 21.76 46 48.41 0 26.83-20.65 48.59-46 48.59s-46-21.76-46-48.37c.07-26.84 20.75-48.52 46-48.52zm-165.85 0c25.35 0 45.85 21.76 45.85 48.41 0 26.83-20.65 48.59-46 48.59s-46-21.76-46-48.37c0-26.84 20.65-48.52 46-48.52z"></path>
                </svg>
              }
            ></OauthCard>
            <OauthCard
              title="Twitch"
              provider="twitch"
              description="If you connect your Twitch account, we will display your stream during the event."
              connected={!!user?.twitch_id}
              logo={
                <svg
                  fillRule="evenodd"
                  viewBox="64 64 896 896"
                  width="100%"
                  height="100%"
                  fill={"#9146ff"}
                  aria-hidden="true"
                >
                  <path d="M166.13 112L114 251.17v556.46h191.2V912h104.4l104.23-104.4h156.5L879 599V112zm69.54 69.5H809.5v382.63L687.77 685.87H496.5L392.27 790.1V685.87h-156.6zM427 529.4h69.5V320.73H427zm191.17 0h69.53V320.73h-69.53z"></path>
                </svg>
              }
            ></OauthCard>
          </div>
        </div>
      </div>
    </div>
  );
}
