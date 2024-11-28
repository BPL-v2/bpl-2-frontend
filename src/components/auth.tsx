import React, { useContext, useEffect } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { Dropdown, MenuProps } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { getUserInfo, logoutUser } from "../client/user-client";

const AuthButton: React.FC = () => {
  const { user, setUser } = useContext(GlobalStateContext);
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Ensure the message is from the expected origin
      if (event.origin !== import.meta.env.VITE_BACKEND_URL) return;
      getUserInfo().then((data) => setUser(data));
    };
    window.addEventListener("message", handleMessage);
    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [setUser]);

  const handleOAuthClick = () => {
    window.open(import.meta.env.VITE_BACKEND_URL + "/oauth2/discord", "");
  };
  const items: MenuProps["items"] = [];
  if (!user?.discord_id) {
    items.push({
      label: "Authenticate with Discord",
      key: "Discord",
      icon: <UserOutlined />,
      onClick: handleOAuthClick,
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

  const menuProps = {
    items,
  };

  return (
    <Dropdown.Button
      menu={menuProps}
      placement="bottom"
      icon={<UserOutlined />}
    >
      {user ? user.discord_name : "Login"}
    </Dropdown.Button>
  );
};

export default AuthButton;
