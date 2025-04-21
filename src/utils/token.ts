import { Permission } from "@client/api";

import { JSX } from "react";
import { router } from "../router";
export type TokenPayload = {
  exp: number;
  permissions: Permission[];
  user_id: number;
};

export function getJwtPayload(): TokenPayload | null {
  const token = localStorage.getItem("auth");
  if (!token) {
    return null;
  }
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }
  try {
    return JSON.parse(atob(parts[1]));
  } catch (e) {
    return null;
  }
}

export function isValidJwt(payload: TokenPayload | null): boolean {
  return payload != null && payload.exp * 1000 > Date.now();
}

export function isLoggedIn() {
  return isValidJwt(getJwtPayload());
}

export function isAdmin() {
  const payload = getJwtPayload();
  return (
    payload != null &&
    isValidJwt(payload) &&
    payload.permissions.includes(Permission.admin)
  );
}

export function requiresAdmin(
  component: () => JSX.Element
): () => JSX.Element | undefined {
  if (isAdmin()) {
    return component;
  } else {
    return () => {
      router.navigate({ to: "/" });
      return undefined;
    };
  }
}
