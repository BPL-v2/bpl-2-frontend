import { createContext } from "react";
import { ScoreCategory } from "@mytypes/score";
import {
  Category,
  Event,
  User,
  EventStatus,
  GameVersion,
  LadderEntry,
} from "@client/api";
import { MinimalTeamUser } from "@mytypes/user";
export type GlobalState = {
  user: User | undefined;
  setUser: (c: User | undefined) => void;
  currentEvent: Event | undefined;
  setCurrentEvent: (c: Event) => void;
  events: Event[];
  setEvents: (c: Event[]) => void;
  rules: Category | undefined;
  setRules: (c: Category | undefined) => void;
  eventStatus: EventStatus | undefined;
  setEventStatus: (c: EventStatus | undefined) => void;
  scores: ScoreCategory | undefined;
  setScores: (c: ScoreCategory | undefined) => void;
  users: MinimalTeamUser[];
  setUsers: (c: MinimalTeamUser[]) => void;
  isMobile: boolean;
  setIsMobile: (c: boolean) => void;
  gameVersion: GameVersion;
  setGameVersion: (c: GameVersion) => void;
  ladder: LadderEntry[];
  setLadder: (c: LadderEntry[]) => void;
  darkMode: boolean;
  setDarkMode: (c: boolean) => void;
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
  darkMode: false,
  setDarkMode: () => {},
});

export const ContextProvider = GlobalStateContext.Provider;
