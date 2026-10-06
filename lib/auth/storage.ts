// Exported so the early-bootstrap inline script in app/[locale]/layout.tsx can
// read the same key without duplicating the literal out of sync.
export const ACCESS_TOKEN_KEY = "qs_access_token";
const USER_KEY = "qs_user";
const REFRESH_TOKEN_KEY = "qs_refresh_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

export function saveTokens(accessToken: string, refreshToken: string): void {
  window.sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  window.sessionStorage.removeItem(USER_KEY);
}

// Last-known profile, so a reload can paint the logged-in header immediately
// and revalidate via /auth/me in the background instead of waiting on it.
export function saveUser(user: unknown): void {
  window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getCachedUser<T>(): T | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.sessionStorage.getItem(USER_KEY) ?? "null");
  } catch {
    return null;
  }
}
