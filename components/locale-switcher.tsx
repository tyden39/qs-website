"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/config";

const LOCALES: { value: Locale; label: string }[] = [
  { value: "vi", label: "VI" },
  { value: "en", label: "EN" },
];

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: Locale) {
    if (next === locale) return;
    // Persist the choice so the `/` redirect (app/page.tsx) honors it next time.
    try {
      localStorage.setItem("locale", next);
    } catch {
      // Ignore storage errors (private mode / disabled storage).
    }
    router.replace(pathname, { locale: next });
  }

  return (
    <div className="flex items-center gap-0.5" aria-label="Language switcher">
      {LOCALES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => switchLocale(value)}
          aria-pressed={locale === value}
          className={[
            // Touch devices get the 44px minimum hit area (Apple HIG / Material);
            // the compact pill look is kept for mouse pointers.
            "px-2 py-0.5 rounded text-label font-mono font-semibold tracking-widest transition-colors pointer-coarse:min-h-11 pointer-coarse:min-w-11",
            locale === value
              ? "bg-ink text-white"
              : "text-muted hover:text-ink",
          ].join(" ")}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
