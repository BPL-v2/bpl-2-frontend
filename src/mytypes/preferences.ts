export type Preferences = {
  theme: string;
  uniqueSets: {
    showCompleted: boolean;
    showFirstAvailable: boolean;
  };
  ladder: {
    showPoPoints: boolean;
  };
};
export const defaultPreferences: Preferences = {
  theme: "dark",
  uniqueSets: {
    showCompleted: true,
    showFirstAvailable: true,
  },
  ladder: {
    showPoPoints: false,
  },
};

export function initPreferences(): Preferences {
  const playerPreferences = localStorage.getItem("preferences");
  if (!playerPreferences) {
    return defaultPreferences;
  }
  const parsedPreferences = JSON.parse(playerPreferences);
  return {
    ...defaultPreferences,
    ...parsedPreferences,
  };
}
