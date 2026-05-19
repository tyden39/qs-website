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
            "px-2 py-0.5 rounded text-[11px] font-mono font-semibold tracking-widest transition-colors",
            locale === value
              ? "bg-accent text-white"
              : "text-muted hover:text-ink",
          ].join(" ")}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
