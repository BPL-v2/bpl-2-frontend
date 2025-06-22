import {
  UserIcon,
  ArrowLeftStartOnRectangleIcon,
  ArrowRightEndOnRectangleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { Link, useRouterState } from "@tanstack/react-router";
import { redirectOauth } from "@utils/oauth";
import { useGetUser } from "@client/query";
import { useQueryClient } from "@tanstack/react-query";

const AuthButton = () => {
  const qc = useQueryClient();
  const state = useRouterState();
  const { user } = useGetUser();

  if (
    user &&
    user.token_expiry_timestamp &&
    new Date(user.token_expiry_timestamp) > new Date()
  ) {
    return (
      <div className="dropdown dropdown-end">
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
                qc.setQueryData(["user"], null);
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
    <button
      className="btn btn-lg py-8 border-0 hover:text-primary-content hover:bg-primary"
      onClick={redirectOauth("poe", state.location.href)}
      // onClick={redirectOauth("discord", state.location.href)}
    >
      <ArrowRightEndOnRectangleIcon className="h-6 w-6" />
      <div className="hidden sm:block">Login</div>
    </button>
  );
};

export default AuthButton;
