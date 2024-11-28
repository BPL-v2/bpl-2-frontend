import { createContext } from "react";
import { User } from "../types/user";
export type GlobalState = {
  user: User | undefined;
  setUser: (c: User | undefined) => void;
};

export const GlobalStateContext = createContext<GlobalState>({
  user: undefined,
  setUser: () => {},
});

export const ContextProvider = GlobalStateContext.Provider;
