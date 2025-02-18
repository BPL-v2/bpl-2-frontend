import { createContext } from "react";
import { ScoreCategory } from "../types/score";
import { Category, Event, User, EventStatus, GameVersion } from "../client";
import { MinimalTeamUser } from "../types/user";
export type GlobalState = {
  user: User | undefined;
  setUser: (c: User | undefined) => void;
  currentEvent: Event | undefined;
  setCurrentEvent: (c: Event | undefined) => void;
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
});

export const ContextProvider = GlobalStateContext.Provider;
