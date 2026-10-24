"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import { getAuthToken } from "@/lib/api/token";
import { AUTH_CHANGE_EVENT } from "@/lib/auth/constants";

const AuthSessionContext = createContext(false);

export function AuthSessionProvider({
  initialHasToken,
  children,
}: {
  initialHasToken: boolean;
  children: React.ReactNode;
}) {
  return <AuthSessionContext.Provider value={initialHasToken}>{children}</AuthSessionContext.Provider>;
}

function subscribeAuthSession(onStoreChange: () => void) {
  window.addEventListener("focus", onStoreChange);
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(AUTH_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("focus", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(AUTH_CHANGE_EVENT, onStoreChange);
  };
}

function getHasAuthToken() {
  return Boolean(getAuthToken());
}

/** Matches the server-rendered session, then follows cookie changes in the browser. */
export function useHasAuthToken() {
  const initialHasToken = useContext(AuthSessionContext);
  return useSyncExternalStore(subscribeAuthSession, getHasAuthToken, () => initialHasToken);
}
