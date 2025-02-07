import { useContext, useEffect } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { Dropdown } from "antd";
import { LoginOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { getUserInfo, logoutUser } from "../client/user-client";
import { router } from "../router";

const AuthButton = () => {
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
        <button
          className={`btn bg-base-300 h-full hover:text-primary hover:border-primary`}
        >
          <UserOutlined /> {user ? user.display_name : "Login"}
        </button>
      </Dropdown>
    );
  }
  return (
    <button
      className={`btn bg-base-300 h-full hover:text-primary hover:border-primary`}
      onClick={() => {
        window.open(import.meta.env.VITE_BACKEND_URL + "/oauth2/discord", "");
      }}
    >
      <LoginOutlined /> Login
    </button>
  );
};

export default AuthButton;
