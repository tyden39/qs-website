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
