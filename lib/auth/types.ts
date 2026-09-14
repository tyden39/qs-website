// Mirrors erp-be's LoginResponse / UserResponse (see erp-fe's
// shared/types/auth.ts and erp-be/docs/02-system-he-thong.md).
export interface AuthRole {
  id: string;
  code: string;
  name: string;
  data_scope: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  full_name?: string;
  is_active: boolean;
  // Omitted entirely by the API for an account with no roles assigned
  // (encoded with `omitempty` on qs-crm-be).
  roles?: AuthRole[];
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

declare global {
  interface Window {
    // Set by the inline bootstrap script in app/[locale]/layout.tsx, which
    // fires /auth/me during HTML parse — before the client JS bundle has even
    // downloaded — so AuthProvider's mount effect (lib/auth/auth-context.tsx)
    // can await an in-flight request instead of starting a fresh one after
    // hydration. Consumed once, then deleted.
    __authMePromise?: Promise<AuthUser>;
  }
}
