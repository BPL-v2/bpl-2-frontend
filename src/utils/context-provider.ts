import { createContext } from "react";
import { MinimalUser, User } from "../types/user";
import { BPLEvent, EventStatus } from "../types/event";
import { ScoringCategory } from "../types/scoring-category";
import { ScoreCategory } from "../types/score";
export type GlobalState = {
  user: User | undefined;
  setUser: (c: User | undefined) => void;
  currentEvent: BPLEvent | undefined;
  setCurrentEvent: (c: BPLEvent | undefined) => void;
  rules: ScoringCategory | undefined;
  setRules: (c: ScoringCategory | undefined) => void;
  eventStatus: EventStatus | undefined;
  setEventStatus: (c: EventStatus | undefined) => void;
  scores: ScoreCategory | undefined;
  setScores: (c: ScoreCategory | undefined) => void;
  users: MinimalUser[];
  setUsers: (c: MinimalUser[]) => void;
  isMobile: boolean;
  setIsMobile: (c: boolean) => void;
};

export const GlobalStateContext = createContext<GlobalState>({
  user: undefined,
  setUser: () => {},
  currentEvent: undefined,
  setCurrentEvent: () => {},
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
});

export const ContextProvider = GlobalStateContext.Provider;
