import { useContext, useEffect } from "react";
import { GlobalStateContext } from "../utils/context-provider";
import { LoginOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { router } from "../router";
import { userApi } from "../client/client";

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
      userApi.getUser().then((data) => setUser(data));
    };
    window.addEventListener("message", handleMessage);
    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [setUser]);

  if (user) {
    return (
      <div className="dropdown dropdown-bottom dropdown-end h-full">
        <button
          tabIndex={0}
          className={`btn bg-base-300 h-full hover:text-primary hover:border-primary`}
        >
          <UserOutlined />{" "}
          <div className="hidden sm:block">
            {user ? user.display_name : "Login"}
          </div>
        </button>
        <ul
          tabIndex={0}
          className="dropdown-content menu bg-base-300 min-w-[100%] z-1 shadow-sm text-base-content"
          onClick={() => {
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement?.blur();
            }
          }}
        >
          <li>
            <div
              onClick={() => {
                router.navigate("/profile");
              }}
            >
              <UserOutlined />
              Profile
            </div>
          </li>
          <li className="text-error">
            <div
              className="hover:bg-error hover:text-error-content"
              onClick={() => {
                userApi.logout().then(() => {
                  setUser(undefined);
                });
              }}
            >
              <LogoutOutlined />
              Logout
            </div>
          </li>
        </ul>
      </div>
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
