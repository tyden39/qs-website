// Pass-through root layout. The real <html>/<body> (with `lang={locale}`) live
// in app/[locale]/layout.tsx so the language tag reflects the active locale.
// This root exists only so the `/` route (app/page.tsx) can render a redirect
// to /vi/ for local dev and direct origin hits; on Cloudflare the `_redirects`
// file handles `/` → `/vi/` at the edge.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
