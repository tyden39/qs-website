"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  fetchCurrentUser,
  login as loginRequest,
  logoutRequest,
  refreshTokens,
  updateProfile,
  registerWebsiteCustomer,
  type WebsiteRegisterPayload,
} from "./api";
import { clearTokens, getAccessToken, getCachedUser, saveUser, getRefreshToken, saveTokens } from "./storage";
import type { AuthUser } from "./types";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  // Sign-up returns a session directly (no verification step), so a new
  // customer lands logged in rather than back at the login form.
  register: (payload: WebsiteRegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateFullName: (fullName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Seed from sessionStorage so a reload paints the logged-in header instantly
  // instead of waiting 8s for /auth/me. The effect below still revalidates.
  const [user, setUser] = useState<AuthUser | null>(() => getCachedUser<AuthUser>());
  const [isLoading, setIsLoading] = useState(() => !!getAccessToken() && !getCachedUser());

  // Bootstrap the session from a token already in storage (page reload) so
  // a logged-in visitor isn't shown the logged-out header on every navigation.
  // The access token is short-lived and expires well before the refresh
  // token, so a plain reload used to 401 on /auth/me and log the user out —
  // fall back to /auth/refresh before giving up on the session.
  useEffect(() => {
    let cancelled = false;
    if (!getAccessToken()) return;

    async function bootstrap() {
      // The inline <script> in app/[locale]/layout.tsx already fired /auth/me
      // during HTML parse, before this component's chunk even downloaded —
      // await that instead of starting a second request from scratch now.
      const prefetched = window.__authMePromise;
      delete window.__authMePromise;

      try {
        const me = await (prefetched ?? fetchCurrentUser());
        console.log("[auth] bootstrap /auth/me success:", me);
        if (!cancelled) {
          setUser(me);
          saveUser(me);
        }
        return;
      } catch (err) {
        console.warn("[auth] bootstrap /auth/me failed, trying token refresh:", err);
      }

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        if (!cancelled) setUser(null);
        return;
      }

      try {
        const session = await refreshTokens(refreshToken);
        saveTokens(session.access_token, session.refresh_token);
        const me = await fetchCurrentUser();
        console.log("[auth] bootstrap refresh success:", me);
        if (!cancelled) {
          setUser(me);
          saveUser(me);
        }
      } catch (err) {
        console.error("[auth] bootstrap refresh failed, clearing tokens:", err);
        clearTokens();
        if (!cancelled) setUser(null);
      }
    }

    bootstrap().finally(() => !cancelled && setIsLoading(false));
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
    saveUser(me);
    setUser(me);
  };

  const register = async (payload: WebsiteRegisterPayload) => {
    const session = await registerWebsiteCustomer(payload);
    saveTokens(session.access_token, session.refresh_token);
    const me = await fetchCurrentUser();
    saveUser(me);
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

  // The API rebuilds full_name as "last first", so the Vietnamese order splits on
  // the final word: "Nguyễn Văn An" → last "Nguyễn Văn", first "An".
  const updateFullName = async (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    const first = parts.pop() ?? "";
    await updateProfile(first, parts.join(" "));
    const me = await fetchCurrentUser();
    saveUser(me);
    setUser(me);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateFullName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
