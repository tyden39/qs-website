"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

/* Floating rail — fixed bottom-right back-to-top button in the QS gold gradient.
   Appears once the page is scrolled past the fold.
   Static-export safe: client component, no dynamic server APIs. */

const chevronUpGlyph = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 15 6-6 6 6" />
  </svg>
);

/* Circular badge geometry + interaction. */
const BADGE =
  "group/fc relative grid h-12 w-12 place-items-center rounded-full shadow-[0_8px_22px_-8px_rgba(10,8,6,.7)] ring-1 ring-black/10 transition-[transform,opacity] duration-200 hover:scale-110 focus-visible:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-2";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-md bg-[#1a1206] px-2.5 py-1 text-meta font-medium text-gold-2 opacity-0 shadow-lg transition-opacity duration-200 group-hover/fc:opacity-100">
      {children}
    </span>
  );
}

export default function FloatingContact() {
  const t = useTranslations("common");
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-5 right-4 z-30 flex flex-col items-center gap-[18px] sm:right-5">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label={t("backToTop")}
        className={`${BADGE} bg-gold-grad text-[#1a1206] ${showTop ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}
      >
        <Label>{t("backToTop")}</Label>
        {chevronUpGlyph}
      </button>
    </div>
  );
}
