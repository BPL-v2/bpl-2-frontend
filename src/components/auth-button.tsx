import React, { useContext, useEffect } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { Button, Dropdown } from "antd";
import { LoginOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { getUserInfo, logoutUser } from "../client/user-client";
import { grey } from "@ant-design/colors";
import { router } from "../router";

type AuthButtonProps = {
  style?: React.CSSProperties;
};
const AuthButton = ({ style }: AuthButtonProps) => {
  const { user, setUser } = useContext(GlobalStateContext);
  const buttonStyle = {
    ...style,
    borderRadius: "0",
    borderWidth: "1px",
    borderStyle: "solid",
    background: grey[7],
  };

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

  if (user) {
    return (
      <Dropdown
        menu={{
          items: [
            {
              label: "Profile",
              key: "profile",
              icon: <UserOutlined />,
              onClick: () => {
                router.navigate("/profile");
              },
            },
            {
              label: "Logout",
              key: "Logout",
              icon: <LogoutOutlined />,
              danger: true,
              onClick: () => {
                logoutUser().then(() => {
                  setUser(undefined);
                });
              },
            },
          ],
        }}
        trigger={["hover"]}
      >
        <Button style={buttonStyle} icon={<UserOutlined />}>
          {user ? user.display_name : "Login"}
        </Button>
      </Dropdown>
    );
  }
  return (
    <Button
      style={buttonStyle}
      icon={<LoginOutlined />}
      onClick={() => {
        window.open(import.meta.env.VITE_BACKEND_URL + "/oauth2/discord", "");
      }}
    >
      Login
    </Button>
  );
};

export default AuthButton;
