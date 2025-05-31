import { createContext } from "react";
import { ScoreObjective } from "@mytypes/score";
import {
  Event,
  User,
  EventStatus,
  GameVersion,
  LadderEntry,
  Objective,
} from "@client/api";
import { MinimalTeamUser } from "@mytypes/user";
import { initPreferences, Preferences } from "@mytypes/preferences";
export type GlobalState = {
  user: User | undefined;
  setUser: (c: User | undefined) => void;
  currentEvent: Event | undefined;
  setCurrentEvent: (c: Event) => void;
  events: Event[];
  setEvents: (c: Event[]) => void;
  rules: Objective | undefined;
  setRules: (c: Objective | undefined) => void;
  eventStatus: EventStatus | undefined;
  setEventStatus: (c: EventStatus | undefined) => void;
  scores: ScoreObjective | undefined;
  setScores: (c: ScoreObjective | undefined) => void;
  users: MinimalTeamUser[];
  setUsers: (c: MinimalTeamUser[]) => void;
  isMobile: boolean;
  setIsMobile: (c: boolean) => void;
  gameVersion: GameVersion;
  setGameVersion: (c: GameVersion) => void;
  ladder: LadderEntry[];
  setLadder: (c: LadderEntry[]) => void;
  preferences: Preferences;
  setPreferences: (c: Preferences) => void;
};

export const GlobalStateContext = createContext<GlobalState>({
  user: undefined,
  setUser: () => {},
  currentEvent: undefined,
  setCurrentEvent: () => {},
  events: [],
  setEvents: () => {},
  rules: undefined,
  setRules: () => {},
  eventStatus: undefined,
  setEventStatus: () => {},
  scores: undefined,
  setScores: () => {},
  users: [],
  setUsers: () => {},
  isMobile: false,
  setIsMobile: () => {},
  gameVersion: GameVersion.poe1,
  setGameVersion: () => {},
  ladder: [],
  setLadder: () => {},
  preferences: initPreferences(),
  setPreferences: () => {},
});

export const ContextProvider = GlobalStateContext.Provider;
