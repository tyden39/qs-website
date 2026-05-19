// Next 16 replaces middleware.ts with proxy.ts (Node-only, runtime not
// configurable). Per platform guidance, proxy handles routing only; auth
// gating lives in app/admin/layout.tsx where the cookie-cached session
// avoids a DB round-trip per request.
import createMiddleware from "next-intl/middleware";
import { routing } from "@/lib/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match everything except API, admin, Next internals, and static assets.
  // /admin lives outside the i18n tree because the console UI is single-language.
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
