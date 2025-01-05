import { Button, Card, Divider, Image, theme } from "antd";
import { useContext } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { DiscordFilled, TwitchOutlined } from "@ant-design/icons";
import { red, green, gray } from "@ant-design/colors";
import { disconnectOauth } from "../client/user-client";

const { useToken } = theme;

export function ProfilePage() {
  const { user, setUser } = useContext(GlobalStateContext);
  const token = useToken().token;
  // const [searchParams] = useSearchParams();
  // const { isMobile } = useContext(GlobalStateContext);
  // const [profileUserName, setProfileUserName] = useState<User | null>(null);
  // useEffect(() => {
  //   const tab = searchParams.get("user");
  //   if (tab) {
  //     setSelectedTab(tab);
  //   }
  // }, [searchParams]);

  function extra(isConnected: boolean, provider: string) {
    return (
      <Button
        style={{
          color: isConnected ? red[5] : green[5],
          borderColor: isConnected ? red[5] : green[5],
        }}
        onClick={() => {
          if (isConnected) {
            disconnectOauth(provider).then((user) => {
              setUser(user);
            });
          } else {
            window.open(
              import.meta.env.VITE_BACKEND_URL + "/oauth2/" + provider,
              ""
            );
          }
        }}
      >
        {isConnected ? "Disconnect" : "Connect"}
      </Button>
    );
  }

  return (
    <div>
      <Divider style={{ borderColor: token.colorPrimary }}>
        {`OAuth Accounts`}
      </Divider>
      <div style={{ textAlign: "left" }}>
        <p>
          At least one account needs to stay connected at all times. When
          connecting, you might automatically be connecting with the account
          that you currently are logged into with your browser, so make sure it
          is the correct one.
        </p>
        <p style={{ fontWeight: "bold" }}>
          Both PoE and Discord accounts are required to participate in the
          event.
        </p>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        <Card
          title="Path of Exile"
          extra={
            <Button style={{ color: green[5], borderColor: green[5] }}>
              {user?.account_name ? "Refresh Access" : "Connect"}
            </Button>
          }
        >
          <Card.Meta
            title={user?.account_name ?? ""}
            avatar={
              <div
                style={{
                  width: 100,
                  height: 100,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  filter: user?.account_name ? "" : "grayscale(100%)",
                }}
              >
                <Image src={"/assets/app-logos/poe2.png"} preview={false} />
              </div>
            }
            description="We need permission to request your Path of Exile character information on your behalf."
          ></Card.Meta>
        </Card>
        <Card title="Discord" extra={extra(!!user?.discord_name, "discord")}>
          <Card.Meta
            title={user?.discord_name ?? ""}
            avatar={
              <div
                style={{
                  width: 100,
                  height: 100,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <DiscordFilled
                  style={{
                    fontSize: "80px",
                    color: user?.discord_name ? "#7289da" : gray[5],
                  }}
                />
              </div>
            }
            description="You must connect your Discord account so that we can assign the required roles on the server."
          ></Card.Meta>
        </Card>
        <Card title="Twitch" extra={extra(!!user?.twitch_name, "twitch")}>
          <Card.Meta
            title={user?.twitch_name ?? ""}
            avatar={
              <div
                style={{
                  width: 100,
                  height: 100,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <TwitchOutlined
                  style={{
                    fontSize: "80px",
                    color: user?.twitch_name ? "#6441a5" : gray[5],
                  }}
                />
              </div>
            }
            description="If you connect your Twitch account, we will display your stream during the event."
          ></Card.Meta>
        </Card>
      </div>
    </div>
  );
}
