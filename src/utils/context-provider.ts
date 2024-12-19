import { createContext } from "react";
import { User } from "../types/user";
import { BPLEvent } from "../types/event";
export type GlobalState = {
  user: User | undefined;
  setUser: (c: User | undefined) => void;
  currentEvent: BPLEvent | undefined;
  setCurrentEvent: (c: BPLEvent | undefined) => void;
};

export const GlobalStateContext = createContext<GlobalState>({
  user: undefined,
  setUser: () => {},
  currentEvent: undefined,
  setCurrentEvent: () => {},
});

export const ContextProvider = GlobalStateContext.Provider;
