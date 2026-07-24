import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import NotFoundContent from "@/components/not-found-content";
import viErrors from "@/messages/vi/errors.json";
import enErrors from "@/messages/en/errors.json";

const sans = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-sans" });
const display = Inter_Tight({ subsets: ["latin", "vietnamese"], variable: "--font-display" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", preload: false });

// The global not-found route renders under the pass-through app/layout.tsx, so
// like app/page.tsx it owns the whole document — the locale layout that
// normally supplies <html>/<body> is not in this branch of the tree.
//
// The static export writes this to out/404.html, which Cloudflare serves for
// every unmatched URL in both locales. Vietnamese (the default locale) is
// prerendered; English is swapped in client-side below.
export const metadata: Metadata = {
  title: viErrors.notFound.metaTitle,
  robots: { index: false, follow: false },
};

const EN = JSON.stringify({
  metaTitle: enErrors.notFound.metaTitle,
  tag: enErrors.notFound.tag,
  heading: enErrors.notFound.heading,
  body: enErrors.notFound.body,
  home: enErrors.notFound.home,
  contact: enErrors.notFound.contact,
});

// Switch to English when the missing URL is under /en/, or — for a path with no
// locale prefix at all — when the visitor's saved or browser language is
// English. Mirrors the detection in app/page.tsx.
const LOCALIZE = `(function(){try{
var p=location.pathname;
if(/^\\/vi(\\/|$)/.test(p))return;
if(!/^\\/en(\\/|$)/.test(p)){
var lang=localStorage.getItem('locale')||navigator.language||'vi';
if(!/^en\\b/i.test(lang))return;
}
var L=${EN};
document.documentElement.lang='en';
document.title=L.metaTitle;
['tag','heading','body','home','contact'].forEach(function(k){
var el=document.querySelector('[data-nf="'+k+'"]');
if(el)el.textContent=L[k];
});
var h=document.querySelector('[data-nf="home"]');if(h)h.setAttribute('href','/en/');
var c=document.querySelector('[data-nf="contact"]');if(c)c.setAttribute('href','/en/contact/');
}catch(e){}})();`;

export default function RootNotFound() {
  return (
    <html lang="vi" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body>
        <NotFoundContent
          labels={viErrors.notFound}
          homeHref="/vi/"
          contactHref="/vi/contact/"
        />
        <Script id="localize-error" strategy="beforeInteractive">
          {LOCALIZE}
        </Script>
      </body>
    </html>
  );
}
