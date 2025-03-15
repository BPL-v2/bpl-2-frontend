import { useEffect, useState } from "react";

export function ThemePicker() {
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    document?.querySelector("html")?.setAttribute("data-theme", theme);
  }, [theme]);
  return (
    <select
      defaultValue="Pick a theme"
      className="select w-40 mx-4"
      onChange={(e) => setTheme(e.target.value)}
    >
      <option disabled={true}>Pick a theme</option>
      {[
        "dark",
        "synthwave",
        "halloween",
        "forest",
        "black",
        "luxury",
        "dracula",
        "business",
        "night",
        "coffee",
        "dim",
        "sunset",
        "abyss",
        "aqua",
        "cyberpunk",
        "valentine",
        "light",
        "cupcake",
        "bumblebee",
        "emerald",
        "corporate",
        "retro",
        "garden",
        "lofi",
        "pastel",
        "fantasy",
        "wireframe",
        "cmyk",
        "autumn",
        "acid",
        "lemonade",

        "winter",
        "nord",
        "caramellatte",
        "silk",
      ].map((theme) => (
        <option key={theme} value={theme} data-theme={theme}>
          {theme}
        </option>
      ))}
    </select>
  );
}
