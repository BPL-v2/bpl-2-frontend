import { createContext } from "react";
import { ScoreObjective } from "@mytypes/score";
import { Event, GameVersion } from "@client/api";
import { initPreferences, Preferences } from "@mytypes/preferences";
export type GlobalState = {
  currentEvent: Event;
  setCurrentEvent: (c: Event) => void;
  scores: ScoreObjective | undefined;
  setScores: (c: ScoreObjective | undefined) => void;
  isMobile: boolean;
  setIsMobile: (c: boolean) => void;
  gameVersion: GameVersion;
  setGameVersion: (c: GameVersion) => void;
  preferences: Preferences;
  setPreferences: (c: Preferences) => void;
};

export const GlobalStateContext = createContext<GlobalState>({
  currentEvent: {
    id: "current",
    game_version: GameVersion.poe1,
    teams: [],
  } as never as Event,
  setCurrentEvent: () => {},
  scores: undefined,
  setScores: () => {},
  isMobile: false,
  setIsMobile: () => {},
  gameVersion: GameVersion.poe1,
  setGameVersion: () => {},
  preferences: initPreferences(),
  setPreferences: () => {},
});

export const ContextProvider = GlobalStateContext.Provider;
