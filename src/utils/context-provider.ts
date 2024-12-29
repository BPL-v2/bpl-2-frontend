import { createContext } from "react";
import { User } from "../types/user";
import { BPLEvent, EventStatus } from "../types/event";
import { ScoringCategory } from "../types/scoring-category";
export type GlobalState = {
  user: User | undefined;
  setUser: (c: User | undefined) => void;
  currentEvent: BPLEvent | undefined;
  setCurrentEvent: (c: BPLEvent | undefined) => void;
  rules: ScoringCategory | undefined;
  setRules: (c: ScoringCategory | undefined) => void;
  eventStatus: EventStatus | undefined;
  setEventStatus: (c: EventStatus | undefined) => void;
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
});

export const ContextProvider = GlobalStateContext.Provider;
