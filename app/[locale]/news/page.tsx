import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAllNews } from "@/lib/data/news";
import { NewsListFilter, type NewsListItem } from "./_components/news-list-filter";
import { FilterPrePaint } from "@/lib/filter-prepaint";
import CircuitTraces from "@/components/circuit-traces";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildTrail, JsonLd } from "@/lib/seo/jsonld";
import type { Locale } from "@/lib/i18n/config";

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
    alternates: buildAlternates("/news", locale),
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
    img: n.coverImage,
  }));
  const breadcrumb = buildTrail(locale, t("breadcrumb.home"), [
    { name: seo("newsTitle"), path: "/news" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      {/* HEAD */}
      <section className="relative overflow-hidden border-b border-line py-12 sm:py-16 pb-10 sm:pb-14"
               style={{ background: "linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)" }}>
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-50" aria-hidden="true"></div>
        <div className="qs-glow hidden sm:block right-[4%] top-[-40%] w-[38%] h-[150%]" aria-hidden="true"></div>
        <CircuitTraces
          variant="light"
          className="hidden md:block absolute inset-y-0 right-0 w-[40%] opacity-[.5] [mask-image:radial-gradient(ellipse_at_right,#000_22%,transparent_72%)] [-webkit-mask-image:radial-gradient(ellipse_at_right,#000_22%,transparent_72%)]"
        />
        <div className="relative max-w-wrap mx-auto px-5 sm:px-8 lg:px-12 flex justify-between items-end gap-8">
          <div>
            <span className="qs-eyebrow qs-rise" style={{ animationDelay: "0ms" }}>{t("list.eyebrow")}</span>
            <h1 className="font-display font-bold text-[clamp(36px,5vw,64px)] tracking-[-.02em] mt-3.5 mb-0 leading-none">
              <span className="block overflow-hidden pb-[.06em]">
                <span className="block qs-rise" style={{ animationDelay: "110ms" }}>
                  {t("list.heading")} <em className="not-italic qs-gold-shimmer">{t("list.headingEm")}</em>
                </span>
              </span>
            </h1>
          </div>
        </div>
      </section>

      {/* Reveals the category from the URL before paint, so a shared
          `?cat=…` link doesn't flash the "all" tab first. */}
      <FilterPrePaint keys={[{ key: "cat" }]} />
      <NewsListFilter articles={articles} />
    </>
  );
}
