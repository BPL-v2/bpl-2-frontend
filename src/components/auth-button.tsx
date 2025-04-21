import { useContext } from "react";
import { GlobalStateContext } from "@utils/context-provider";
import {
  UserIcon,
  ArrowLeftStartOnRectangleIcon,
  ArrowRightEndOnRectangleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { Link, useRouterState } from "@tanstack/react-router";

const AuthButton = () => {
  const { user, setUser } = useContext(GlobalStateContext);
  const state = useRouterState();

  if (user) {
    return (
      <div className="dropdown">
        <div
          tabIndex={0}
          className={`btn btn-lg py-8 border-0 hover:text-primary-content hover:bg-primary`}
        >
          <UserIcon className="h-6 w-6" />
          <div className="hidden sm:block">
            {user ? user.display_name : "Login"}
          </div>
        </div>
        <ul
          tabIndex={0}
          className="dropdown-content menu bg-base-300 border-2 border-base-100 z-1 text-lg rounded-field"
          onClick={() => {
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement?.blur();
            }
          }}
        >
          <li>
            <Link to={`/settings`} className="flex flex-row gap-2">
              <Cog6ToothIcon className="h-6 w-6" /> Settings
            </Link>
            <Link
              to={`/profile/$userId`}
              params={{ userId: user.id }}
              className="flex flex-row gap-2"
            >
              <UserIcon className="h-6 w-6" /> Profile
            </Link>
          </li>
          <li className="text-error">
            <div
              className="hover:bg-error hover:text-error-content"
              onClick={() => {
                localStorage.removeItem("auth");
                setUser(undefined);
              }}
            >
              <ArrowLeftStartOnRectangleIcon className="h-6 w-6" />
              Logout
            </div>
          </li>
        </ul>
      </div>
    );
  }
  return (
    <a
      href={
        import.meta.env.VITE_BACKEND_URL +
        "/oauth2/discord?last_url=" +
        state.location.href
      }
      className="btn btn-lg py-8 border-0 hover:text-primary-content hover:bg-primary"
    >
      <ArrowRightEndOnRectangleIcon className="h-6 w-6" />
      <div className="hidden sm:block">Login</div>
    </a>
  );
};

export default AuthButton;
