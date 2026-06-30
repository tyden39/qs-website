import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAllNews } from "@/lib/data/news";
import { NewsListFilter, type NewsListItem } from "./_components/news-list-filter";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildBreadcrumbList, JsonLd } from "@/lib/seo/jsonld";
import type { Locale } from "@/lib/i18n/config";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://qstech.vn";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  const title = t("newsTitle");
  const description = t("newsDescription");
  return {
    title,
    description,
    alternates: buildAlternates("/news"),
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "en" ? "en_US" : "vi_VN",
      url: "/news",
      images: [{ url: "/og-default.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function News({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "news" });
  const seo = await getTranslations({ locale, namespace: "seo" });
  const news = await getAllNews(locale);
  const articles: NewsListItem[] = news.map((n) => ({
    slug: n.slug,
    title: n.title,
    excerpt: n.excerpt,
    cat: n.cat,
    date: n.date,
    categoryId: n.categoryId,
  }));
  const breadcrumb = buildBreadcrumbList([
    { name: t("breadcrumb.home"), url: `${APP_URL}${locale === "en" ? "/en" : ""}` },
    { name: seo("newsTitle"), url: `${APP_URL}${locale === "en" ? "/en" : ""}/news` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      {/* HEAD */}
      <section className="relative overflow-hidden border-b border-line py-16 pb-14"
               style={{ background: "linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)" }}>
        <div className="absolute inset-0 qs-grid-bg opacity-50"></div>
        <div className="relative max-w-wrap mx-auto px-12 flex justify-between items-end gap-8">
          <div>
            <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("list.eyebrow")}</span>
            <h1 className="font-display font-bold text-[64px] tracking-[-.02em] mt-3.5 mb-0 leading-none">
              {t("list.heading")} <em className="not-italic bg-gold-grad bg-clip-text text-transparent">{t("list.headingEm")}</em>
            </h1>
          </div>
        </div>
      </section>

      <NewsListFilter articles={articles} />
    </>
  );
}
