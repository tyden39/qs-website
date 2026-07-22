import type { Metadata } from "next";

// Static export has no server redirect. Cloudflare `_redirects` maps `/` → `/vi/`
// at the edge; this prerendered page is the fallback for direct origin hits and
// local `next dev` / `serve out` testing. The pass-through root layout renders
// no <html>/<body>, so this page owns the full document.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Client-side locale detection: prefer a previously chosen locale (persisted by
// the language switcher), else the browser's language, else Vietnamese. Runs
// before paint via location.replace so there is no flash. The <meta refresh> is
// the no-JS fallback and points at /vi/ (the default locale).
const DETECT_AND_REDIRECT = `(function(){try{
var saved=localStorage.getItem('locale');
var lang=saved||navigator.language||navigator.languages&&navigator.languages[0]||'vi';
var target=/^en\\b/i.test(lang)?'/en/':'/vi/';
location.replace(target);
}catch(e){location.replace('/vi/');}})();`;

export default function RootRedirect() {
  return (
    <html lang="vi">
      <head>
        <meta httpEquiv="refresh" content="0; url=/vi/" />
        <script dangerouslySetInnerHTML={{ __html: DETECT_AND_REDIRECT }} />
      </head>
      <body>
        <p style={{ fontFamily: "sans-serif", padding: "2rem" }}>
          {/* Plain anchor on purpose: this pre-locale redirect shell lives outside
              the i18n routing and owns the whole document, so next/link's <Link>
              (which expects the App Router locale tree) doesn't apply here. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          Đang chuyển hướng tới <a href="/vi/">/vi/</a>…
        </p>
      </body>
    </html>
  );
}
