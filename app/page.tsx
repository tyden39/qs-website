import type { Metadata } from "next";

// Static export has no server redirect. Cloudflare `_redirects` (Phase 3) maps
// `/` → `/vi/` at the edge; this prerendered page is the belt-and-suspenders
// fallback for direct origin hits and local `serve out` testing.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function RootRedirect() {
  return (
    <>
      <meta httpEquiv="refresh" content="0; url=/vi/" />
      <script dangerouslySetInnerHTML={{ __html: "location.replace('/vi/')" }} />
      <p style={{ fontFamily: "sans-serif", padding: "2rem" }}>
        Đang chuyển hướng tới <a href="/vi/">/vi/</a>…
      </p>
    </>
  );
}
