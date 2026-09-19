import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import NotFoundContent from "@/components/not-found-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("errors.notFound");
  // Static export serves 404 as a real page, so it needs the noindex tag that a
  // 404 status would otherwise imply.
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

// Reached when notFound() is called from inside the locale tree, where the
// locale layout supplies <html>/<body>. Unmatched URLs never reach this route
// on a static host — those are served out/404.html from the root
// app/not-found.tsx, which owns its own document.
export default async function NotFound() {
  const t = await getTranslations("errors.notFound");
  const locale = await getLocale();
  return (
    <NotFoundContent
      labels={{
        tag: t("tag"),
        heading: t("heading"),
        body: t("body"),
        home: t("home"),
        contact: t("contact"),
      }}
      homeHref={`/${locale}/`}
      contactHref={`/${locale}/contact/`}
    />
  );
}
