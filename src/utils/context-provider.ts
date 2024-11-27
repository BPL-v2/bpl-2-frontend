import { createContext } from "react";
import { User } from "../types/user";
export type GlobalState = {
  jwtToken: string;
  setJwtToken: (c: string) => void;
  user: User | undefined;
  setUser: (c: User | undefined) => void;
};

export const GlobalStateContext = createContext<GlobalState>({
  jwtToken: "",
  setJwtToken: () => {},
  user: undefined,
  setUser: () => {},
});

export const ContextProvider = GlobalStateContext.Provider;
