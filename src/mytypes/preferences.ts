export type Preferences = {
  theme: string;
  uniqueSets: {
    showCompleted: boolean;
    showFirstAvailable: boolean;
  };
  ladder: {
    Rank: boolean;
    Account: boolean;
    Character: boolean;
    Team: boolean;
    Ascendancy: boolean;
    Level: boolean;
    Delve: boolean;
    DPS: boolean;
    EHP: boolean;
    Armour: boolean;
    Evasion: boolean;
    ES: false;
    "Ele max hit": boolean;
    "Phys max hit": boolean;
    HP: boolean;
    Mana: boolean;
    "Movement Speed": boolean;
    Pantheon: boolean;
    "Uber Lab": boolean;
    Atlas: boolean;
    "P.O.": boolean;
  };
  limitTeams: number;
  version?: number;
};
export const defaultPreferences: Preferences = {
  theme: "system",
  uniqueSets: {
    showCompleted: true,
    showFirstAvailable: true,
  },
  ladder: {
    Rank: true,
    Account: false,
    Character: true,
    Team: true,
    Ascendancy: true,
    Level: true,
    Delve: false,
    DPS: true,
    EHP: true,
    Armour: false,
    Evasion: false,
    ES: false,
    HP: false,
    Mana: false,
    "Ele max hit": false,
    "Phys max hit": false,
    "Movement Speed": false,
    Pantheon: false,
    "Uber Lab": false,
    Atlas: false,
    "P.O.": false,
  },
  limitTeams: 0,
  version: 0,
};

export function initPreferences(): Preferences {
  const playerPreferences = localStorage.getItem("preferences");
  if (!playerPreferences) {
    return defaultPreferences;
  }
  const parsedPreferences = JSON.parse(playerPreferences);
  if (parsedPreferences.version === undefined) {
    parsedPreferences.ladder = defaultPreferences.ladder;
  }
  return {
    ...defaultPreferences,
    ...parsedPreferences,
  };
}
