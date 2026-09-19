import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import NotFoundContent from "@/components/not-found-content";
import viErrors from "@/messages/vi/errors.json";
import enErrors from "@/messages/en/errors.json";

// Same family variable as the locale layout, which globals.css maps onto every
// role token (--font-sans / --font-display / --font-mono). This route owns its
// own document, so it must set it itself.
const sans = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-inter" });

// The global not-found route renders under the pass-through app/layout.tsx, so
// it owns the whole document itself — the locale layout that normally supplies
// <html>/<body> is not in this branch of the tree.
//
// The static export writes this to out/404.html, which Firebase Hosting serves
// for every unmatched URL in both locales. Vietnamese (the default locale) is
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
// English. A 404 has no host-side redirect to lean on, so this is the only
// place left that still sniffs the language in the browser.
//
// It ships as a raw inline <script> at the end of <body>, deliberately not
// next/script. `strategy="beforeInteractive"` is only honoured in the root
// layout; from a route it degrades to pushing this source onto `self.__next_s`
// as a string for the async React runtime chunk to fetch, parse and replay —
// which lands well after first paint, so an English visitor read a full screen
// of Vietnamese before it swapped. Inline here it executes during parse, after
// the elements it rewrites exist and before the render-blocking stylesheet lets
// anything paint.
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
    <html lang="vi" className={sans.variable}>
      <body>
        <NotFoundContent
          labels={viErrors.notFound}
          homeHref="/vi/"
          contactHref="/vi/contact/"
        />
        <script dangerouslySetInnerHTML={{ __html: LOCALIZE }} />
      </body>
    </html>
  );
}
