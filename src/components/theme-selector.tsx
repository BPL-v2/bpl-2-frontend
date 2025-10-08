import { GlobalStateContext } from "@utils/context-provider";
import { useContext } from "react";

export default function ThemeSelector() {
  const { preferences, setPreferences } = useContext(GlobalStateContext);
  return (
    <div title="Change Theme" className="dropdown dropdown-start block">
      <div
        tabIndex={0}
        role="button"
        className="btn w-30 btn-outline"
        aria-label="Change Theme"
      >
        {preferences.theme}
      </div>
      <div
        tabIndex={0}
        className="dropdown-content h-80 max-h-[calc(100vh-8.6rem)] overflow-x-hidden overflow-y-auto rounded-box border-2 border-base-300 bg-base-200 shadow-xl"
      >
        <ul className="menu w-56">
          <li className="menu-title text-xs">Theme</li>
          {[
            "light",
            "dark",
            "cupcake",
            "bumblebee",
            "emerald",
            "corporate",
            "synthwave",
            "retro",
            "cyberpunk",
            "valentine",
            "halloween",
            "garden",
            "forest",
            "aqua",
            "lofi",
            "pastel",
            "fantasy",
            "wireframe",
            "black",
            "luxury",
            "dracula",
            "cmyk",
            "autumn",
            "business",
            "acid",
            "lemonade",
            "night",
            "coffee",
            "winter",
            "dim",
            "nord",
            "sunset",
            "caramellatte",
            "abyss",
            "silk",
          ].map((theme) => (
            <li key={theme}>
              <button
                className="gap-3 px-2"
                data-set-theme={theme}
                data-act-className="[&amp;_svg]:visible"
                onClick={() => {
                  document
                    .querySelector("html")
                    ?.setAttribute("data-theme", theme);
                  setPreferences({ ...preferences, theme: theme });
                  localStorage.setItem(
                    "preferences",
                    JSON.stringify({
                      ...JSON.parse(
                        localStorage.getItem("preferences") ?? "{}",
                      ),
                      theme: theme,
                    }),
                  );
                }}
              >
                <div
                  data-theme={theme}
                  className="grid shrink-0 grid-cols-2 gap-0.5 rounded-md bg-base-100 p-1 shadow-sm"
                >
                  <div className="size-1 rounded-full bg-base-content"></div>
                  <div className="size-1 rounded-full bg-primary"></div>
                  <div className="size-1 rounded-full bg-secondary"></div>
                  <div className="size-1 rounded-full bg-accent"></div>
                </div>
                <div className="w-32 truncate">{theme}</div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="invisible h-3 w-3 shrink-0"
                >
                  <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"></path>
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
