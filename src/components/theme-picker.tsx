import { useEffect, useState } from "react";

export function ThemePicker() {
  const [theme, setTheme] = useState("ocean");
  useEffect(() => {
    document?.querySelector("html")?.setAttribute("data-theme", theme);
  }, [theme]);
  return (
    <select
      defaultValue="Pick a theme"
      className="select w-35"
      onChange={(e) => setTheme(e.target.value)}
    >
      <option disabled={true}>Pick a theme</option>
      {[
        "ocean",
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
        "sky",
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
