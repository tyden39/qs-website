import type { Metadata } from "next";
import { Link } from "@/lib/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "errors.forbidden" });
  // An error page carries no content worth ranking; indexing it only surfaces a
  // dead end in the SERP under the site's own brand terms.
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

export default async function ForbiddenPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "errors.forbidden" });
  return (
    <section className="min-h-[70vh] bg-paper grid place-items-center">
      <div className="max-w-md text-center px-6">
        <div className="font-mono text-label tracking-[.18em] uppercase text-gold-1">{t("tag")}</div>
        <h1 className="font-display font-bold text-h2 mt-3 tracking-[-.02em]">{t("heading")}</h1>
        <p className="mt-4 text-meta text-muted">
          {t("body")}
        </p>
        <div className="mt-7 flex gap-3 justify-center">
          <Link className="qs-btn qs-btn-gold" href="/">{t("home")}</Link>
          <Link className="qs-btn qs-btn-ghost" href="/login">{t("login")}</Link>
        </div>
      </div>
    </section>
  );
}
