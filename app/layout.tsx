import type { Metadata } from "next";
import { APP_URL } from "@/lib/seo/app-url";

// Pass-through root layout. The real <html>/<body> (with `lang={locale}`) live
// in app/[locale]/layout.tsx so the language tag reflects the active locale.
// This root exists only so the `/` route (app/page.tsx) can render a redirect
// to /vi/ for local dev and direct origin hits; on Cloudflare the `_redirects`
// file handles `/` → `/vi/` at the edge.
// Single source of the base URL for resolving relative OG/Twitter image paths.
// It lives at the root (not in app/[locale]/layout.tsx) so routes rendered
// outside the locale tree — `/`, 404, _not-found — inherit it too; without it
// Next resolves those images against localhost and the previews break.
export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
