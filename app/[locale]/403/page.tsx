import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "errors.forbidden" });
  return { title: t("metaTitle") };
}

export default async function ForbiddenPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "errors.forbidden" });
  return (
    <section className="min-h-[70vh] bg-paper grid place-items-center">
      <div className="max-w-md text-center px-6">
        <div className="font-mono text-[11px] tracking-[.18em] uppercase text-gold-1">{t("tag")}</div>
        <h1 className="font-display font-bold text-4xl mt-3 tracking-[-.02em]">{t("heading")}</h1>
        <p className="mt-4 text-sm text-muted">
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
