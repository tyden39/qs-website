import type { Locale } from "@/lib/i18n/config";

export type I18nField<T> = { vi: T; en?: T };

export function pickLocale<T>(field: I18nField<T> | null | undefined, locale: Locale): T | null {
  if (!field) return null;
  return (field[locale] ?? field.vi ?? null) as T | null;
}

export function pickLocaleArray<T>(items: I18nField<T>[] | null | undefined, locale: Locale): T[] {
  if (!items) return [];
  return items.map((it) => pickLocale(it, locale)).filter((v): v is T => v !== null);
}
