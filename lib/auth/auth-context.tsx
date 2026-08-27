"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchCurrentUser, login as loginRequest, logoutRequest } from "./api";
import { clearTokens, getAccessToken, saveTokens } from "./storage";
import type { AuthUser } from "./types";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(() => !!getAccessToken());

  // Bootstrap the session from a token already in storage (page reload) so
  // a logged-in visitor isn't shown the logged-out header on every navigation.
  useEffect(() => {
    let cancelled = false;
    if (!getAccessToken()) return;
    fetchCurrentUser()
      .then((me) => {
        console.log("[auth] bootstrap /auth/me success:", me);
        if (!cancelled) setUser(me);
      })
      .catch((err) => {
        console.error("[auth] bootstrap /auth/me failed, clearing tokens:", err);
        clearTokens();
      })
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const session = await loginRequest(email, password);
    saveTokens(session.access_token, session.refresh_token);
    // /auth/login only returns a partial user (no roles/permissions);
    // fetch the full profile from /auth/me so `user` is always complete.
    const me = await fetchCurrentUser();
    console.log("[auth] login success, user:", me);
    setUser(me);
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch {
      // Best-effort: still clear the local session even if the server call fails.
    }
    clearTokens();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
