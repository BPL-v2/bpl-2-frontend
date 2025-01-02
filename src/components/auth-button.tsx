import React, { useContext, useEffect } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { Button, Dropdown, MenuProps } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { getUserInfo, logoutUser } from "../client/user-client";
import { greyDark } from "@ant-design/colors";

type AuthButtonProps = {
  style?: React.CSSProperties;
};
const AuthButton = ({ style }: AuthButtonProps) => {
  const { user, setUser } = useContext(GlobalStateContext);
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        new URL(event.origin).hostname !==
          new URL(import.meta.env.VITE_BACKEND_URL).hostname ||
        event.data["bpl-auth"] !== true
      )
        return;
      getUserInfo().then((data) => setUser(data));
    };
    window.addEventListener("message", handleMessage);
    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [setUser]);

  const items: MenuProps["items"] = [];
  if (!user?.discord_id) {
    items.push({
      label: "Authenticate with Discord",
      key: "Discord",
      icon: <UserOutlined />,
      onClick: () =>
        window.open(import.meta.env.VITE_BACKEND_URL + "/oauth2/discord", ""),
    });
  }
  if (!user?.account_name) {
    items.push({
      label: "Authenticate with PoE",
      key: "PoE",
      icon: <UserOutlined />,
      onClick: () => console.log("PoE auth requested"),
    });
  }
  if (!user?.twitch_id) {
    items.push({
      label: "Authenticate with Twitch",
      key: "Twitch",
      icon: <UserOutlined />,
      onClick: () =>
        window.open(import.meta.env.VITE_BACKEND_URL + "/oauth2/twitch", ""),
    });
  }

  if (user) {
    items.push({
      label: "Logout",
      key: "Logout",
      icon: <UserOutlined />,
      danger: true,
      onClick: () => {
        logoutUser().then(() => setUser(undefined));
      },
    });
  }

  return (
    <Dropdown menu={{ items }} trigger={["hover"]}>
      <Button
        style={{
          ...style,
          border: "0px",
          borderRadius: "0",
          background: greyDark[2],
        }}
        icon={<UserOutlined />}
      >
        {user ? user.display_name : "Login"}
      </Button>
    </Dropdown>
  );
};

export default AuthButton;
