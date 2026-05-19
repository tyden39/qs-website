import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "./server";

export type AdminRole = "admin" | "editor";
export type UserRole = AdminRole | "customer";

// React-cached so the admin layout, server actions and data helpers can all
// call this within a single render without hitting the DB more than once.
// The Better Auth cookie-cache plugin further short-circuits the DB call
// for ~5 minutes after the first verification.
export const getCachedSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

export async function requireSession() {
  const session = await getCachedSession();
  if (!session) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return session;
}

export async function requireRole(roles: UserRole[]) {
  const session = await requireSession();
  const role = session.user.role as UserRole | undefined;
  if (!role || !roles.includes(role)) {
    throw new Response("Forbidden", { status: 403 });
  }
  return session;
}
