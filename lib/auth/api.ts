import type { AuthUser, LoginResponse } from "./types";
import { getAccessToken } from "./storage";

// Same shape as /auth/login: erp-be issues a fresh access+refresh pair rather
// than extending the old one, so both must be re-saved after a refresh.
export type RefreshResponse = Pick<LoginResponse, "access_token" | "refresh_token">;

const DEFAULT_API_BASE = "https://crm.qstcnc.com/api/v1";

// Exported so the early-bootstrap inline script in app/[locale]/layout.tsx can
// fire the same /auth/me request at the same base URL without duplicating the
// env-var fallback logic out of sync.
export function apiBase(): string {
  return (process.env.NEXT_PUBLIC_CRM_API_BASE ?? DEFAULT_API_BASE).replace(/\/+$/, "");
}

export class AuthApiError extends Error {
  constructor(
    message: string,
    public status: number,
    // erp-be's stable error code (e.g. "PHONE_ALREADY_EXISTS"), when present —
    // callers use this to pick a translated message instead of showing the
    // English `message` string straight from the API.
    public code?: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
    throw new AuthApiError(data.error ?? `Request failed (${res.status})`, res.status, data.code);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// The login field is called `username` on erp-be, but a Customer Portal
// account registers with just an email — so the email the form collects is
// passed through as that `username` value.
export function login(email: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username: email, password }),
  });
}

export interface WebsiteRegisterPayload {
  full_name: string;
  phone: string;
  email: string;
  password: string;
  region?: string;
}

// Site sign-up. Distinct from the Customer Portal's /auth/customer-register,
// which requires an emailed OTP before the account works — this endpoint has no
// verification step, so it returns a ready session and the visitor lands logged
// in. It also creates the CRM lead record (source "website", status NEW).
export function registerWebsiteCustomer(payload: WebsiteRegisterPayload): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/website-register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchCurrentUser(): Promise<AuthUser> {
  return request<AuthUser>("/auth/me");
}

// The access token is short-lived; the refresh token outlives it so a page
// reload doesn't force a re-login every time the access token has expired.
export function refreshTokens(refreshToken: string): Promise<RefreshResponse> {
  return request<RefreshResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

export function logoutRequest(): Promise<void> {
  return request<void>("/auth/logout", { method: "POST" });
}

// Mints a short-lived, single-use ticket for the current session so the
// target app (ERP or Portal) can exchange it for its own session via
// `{targetUrl}/sso?ticket=...` without asking the user to log in again.
export function issueSSOTicket(): Promise<{ ticket: string; expires_in: number }> {
  return request<{ ticket: string; expires_in: number }>("/auth/sso/ticket", { method: "POST" });
}
