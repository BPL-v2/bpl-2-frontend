import { useGetUser } from "@client/query";
import {
  ArrowLeftStartOnRectangleIcon,
  ArrowRightEndOnRectangleIcon,
  Cog6ToothIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { redirectOauth } from "@utils/oauth";

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
          className={
            "btn border-0 py-8 btn-lg hover:bg-primary hover:text-primary-content"
          }
        >
          <UserIcon className="size-6" />
          <div className="hidden sm:block">
            {user ? user.display_name : "Login"}
          </div>
        </div>
        <ul
          tabIndex={0}
          className="dropdown-content menu z-1 rounded-field border-2 border-base-100 bg-base-300 text-lg"
          onClick={() => {
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement?.blur();
            }
          }}
        >
          <li>
            <Link to={"/settings"} className="flex flex-row gap-2">
              <Cog6ToothIcon className="size-6" /> Settings
            </Link>
            <Link
              to={"/profile/$userId"}
              params={{ userId: user.id }}
              className="flex flex-row gap-2"
            >
              <UserIcon className="size-6" /> Profile
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
              <ArrowLeftStartOnRectangleIcon className="size-6" />
              Logout
            </div>
          </li>
        </ul>
      </div>
    );
  }
  return (
    <button
      className="btn border-0 py-8 btn-lg hover:bg-primary hover:text-primary-content"
      onClick={redirectOauth("poe", state.location.href)}
      title="Login with Path of Exile and Discord"
    >
      <ArrowRightEndOnRectangleIcon className="size-6" />
      <div className="hidden sm:block">Login</div>
    </button>
  );
};

export default AuthButton;
