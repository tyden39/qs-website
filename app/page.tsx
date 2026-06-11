import type { Metadata } from "next";

// Static export can't run server redirects, so `/` ships a minimal page that
// bounces to the default locale. Cloudflare `_redirects` (Phase 3) handles this
// at the edge with a 301; this client fallback covers direct/cached hits.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function RootRedirect() {
  return (
    <>
      <meta httpEquiv="refresh" content="0; url=/vi/" />
      <script
        dangerouslySetInnerHTML={{
          __html: "location.replace('/vi/');",
        }}
      />
      <p style={{ fontFamily: "sans-serif", padding: "2rem" }}>
        Redirecting to <a href="/vi/">qstech.vn</a>…
      </p>
    </>
  );
}
