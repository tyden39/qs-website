import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/lib/i18n/navigation";
import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAllNews, getNewsBySlug, getNewsSlugs } from "@/lib/data/news";
import { routing } from "@/lib/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildArticle, buildTrail, JsonLd } from "@/lib/seo/jsonld";
import type { Locale } from "@/lib/i18n/config";
import { APP_URL } from "@/lib/seo/app-url";
import RailNudge from "@/components/rail-nudge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const n = await getNewsBySlug(slug, locale);
  if (!n) return {};
  return {
    title: n.title,
    description: n.excerpt?.slice(0, 160),
    alternates: buildAlternates(`/news/${slug}`, locale),
    openGraph: {
      title: n.title,
      description: n.excerpt,
      type: "article",
      locale: locale === "en" ? "en_US" : "vi_VN",
      url: `/news/${slug}`,
      images: [
        {
          url: n.coverImage ?? "/og-default.png",
          width: 1200,
          height: 630,
          alt: n.title,
        },
      ],
      publishedTime: n.publishedAt?.toISOString(),
    },
    twitter: { card: "summary_large_image", title: n.title, description: n.excerpt },
  };
}

const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s",
  "ul", "ol", "li",
  "h1", "h2", "h3", "h4",
  "a", "img",
  "blockquote", "code", "pre", "hr",
];

function safeHtml(raw: string): string {
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ["href", "src", "alt", "title", "rel", "target", "id"],
    ALLOWED_URI_REGEXP: /^(?:(?:https?:|mailto:|\/)|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  });
}

const VI_MAP: Record<string, string> = { à:"a",á:"a",ả:"a",ã:"a",ạ:"a",ă:"a",ằ:"a",ắ:"a",ẳ:"a",ẵ:"a",ặ:"a",â:"a",ầ:"a",ấ:"a",ẩ:"a",ẫ:"a",ậ:"a",đ:"d",è:"e",é:"e",ẻ:"e",ẽ:"e",ẹ:"e",ê:"e",ề:"e",ế:"e",ể:"e",ễ:"e",ệ:"e",ì:"i",í:"i",ỉ:"i",ĩ:"i",ị:"i",ò:"o",ó:"o",ỏ:"o",õ:"o",ọ:"o",ô:"o",ồ:"o",ố:"o",ổ:"o",ỗ:"o",ộ:"o",ơ:"o",ờ:"o",ớ:"o",ở:"o",ỡ:"o",ợ:"o",ù:"u",ú:"u",ủ:"u",ũ:"u",ụ:"u",ư:"u",ừ:"u",ứ:"u",ử:"u",ữ:"u",ự:"u",ỳ:"y",ý:"y",ỷ:"y",ỹ:"y",ỵ:"y" };

function slugifyVi(s: string): string {
  return s.toLowerCase().replace(/[àáảãạăằắẳẵặâầấẩẫậđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]/g, (c) => VI_MAP[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "section";
}

/** Sanitize, then add stable ids to <h2> headings and return a TOC. */
function buildArticleBody(raw: string): { html: string; toc: { id: string; text: string }[] } {
  const html = safeHtml(raw);
  const toc: { id: string; text: string }[] = [];
  const used = new Set<string>();
  const out = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (_m, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    let id = slugifyVi(text);
    while (used.has(id)) id += "-2";
    used.add(id);
    toc.push({ id, text });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { html: out, toc };
}

export async function generateStaticParams() {
  const slugs = await getNewsSlugs();
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export default async function NewsDetail({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "news" });
  const n = await getNewsBySlug(slug, locale);
  if (!n) notFound();
  const allNews = await getAllNews(locale);
  const others = allNews.filter(x => x.slug !== slug).slice(0, 3);
  const isFlagship = slug === "astro-12x";
  const articleJsonLd = buildArticle(n, locale);
  const breadcrumb = buildTrail(locale, t("breadcrumb.home"), [
    { name: t("breadcrumb.news"), path: "/news" },
    { name: n.title, path: `/news/${slug}` },
  ]);

  const metaRows: [string, string][] = [
    [t("meta.dateLabel"), n.date],
    [t("meta.authorLabel"), t("meta.author")],
    [t("meta.readTime"), t("detailPage.readValue")],
    [t("meta.category"), n.cat],
  ];

  // Real crawled body: sanitize, add heading ids, and derive an in-page TOC.
  const article = buildArticleBody(n.bodyHtml);
  const hasToc = article.toc.length >= 2;

  return (
    <article>
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumb} />
      {/* CRUMB */}
      <div className="bg-white border-b border-line py-3">
        <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12 flex items-center gap-2 sm:gap-2.5 font-mono text-label-xs sm:text-label text-muted tracking-[.1em] sm:tracking-[.12em] uppercase overflow-hidden">
          <Link href="/" className="hover:text-ink whitespace-nowrap">{t("breadcrumb.home")}</Link><span className="text-gold-1">/</span>
          <Link href="/news" className="hover:text-ink whitespace-nowrap">{t("breadcrumb.news")}</Link><span className="text-gold-1">/</span>
          <Link href="/news" className="hover:text-ink whitespace-nowrap">{n.cat}</Link>
          <span className="hidden sm:inline text-gold-1">/</span>
          <span className="hidden sm:inline text-ink font-semibold truncate">{n.title.slice(0, 40)}…</span>
        </div>
      </div>

      {/* HEAD */}
      <section className="py-9 pb-8 sm:py-16 sm:pb-12 bg-white border-b border-line">
        <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12 grid md:grid-cols-[1fr_320px] gap-8 md:gap-16 items-start">
          {n.coverImage && (
            <div className="relative col-span-full aspect-[16/10] overflow-hidden border border-line bg-paper md:hidden">
              <Image
                src={n.coverImage}
                alt={n.title}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </div>
          )}
          <div>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="inline-block font-mono text-label-xs bg-gold text-ink-2 py-1 px-3 tracking-[.16em] uppercase font-semibold">[ {n.cat} ]</span>
              {isFlagship && <span className="inline-block font-mono text-label-xs bg-ink text-gold-2 py-1 px-3 tracking-[.16em] uppercase font-semibold">{t("detailPage.flagshipBadge")}</span>}
            </div>
            <h1 className="font-display font-bold tracking-[-.02em] leading-[1.12] text-balance mt-3.5 sm:mt-4.5 mb-0 break-words"
                style={{fontSize:"clamp(26px,6vw,60px)"}}>{n.title}</h1>
          </div>
          <aside className="border border-line p-5 sm:p-6 grid grid-cols-2 md:grid-cols-1 gap-4 bg-paper">
            {metaRows.map(([l,v]) => (
              <div key={l} className="flex flex-col gap-1">
                <span className="font-mono text-label-xs text-muted tracking-[.18em] uppercase">{l}</span>
                <span className="font-display text-meta font-semibold text-ink">{v}</span>
              </div>
            ))}
          </aside>
        </div>
      </section>

      {/* BODY */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className={`max-w-wrap mx-auto px-5 sm:px-8 lg:px-12 grid gap-10 md:gap-20 items-start ${hasToc ? "md:grid-cols-[1fr_240px]" : ""}`}>
          <article
            className="prose prose-sm md:prose-base max-w-[72ch]
                       prose-headings:font-display prose-headings:font-bold prose-headings:tracking-[-.01em]
                       prose-h2:text-title md:prose-h2:text-subhead prose-h2:leading-[1.25] prose-h2:mt-9 md:prose-h2:mt-12 prose-h2:mb-4 prose-h2:scroll-mt-28
                       prose-h2:before:content-[''] prose-h2:before:block prose-h2:before:w-8 prose-h2:before:h-0.5 prose-h2:before:bg-gold-grad prose-h2:before:mb-3.5
                       prose-p:leading-[1.85] prose-p:text-[#2a2520]
                       prose-a:text-gold-1 prose-a:no-underline hover:prose-a:underline
                       prose-strong:text-ink prose-li:marker:text-gold-1
                       prose-img:w-full prose-img:rounded prose-img:border prose-img:border-line prose-img:my-6
                       prose-blockquote:border-l-[3px] prose-blockquote:border-gold-2 prose-blockquote:bg-paper prose-blockquote:not-italic prose-blockquote:py-3 prose-blockquote:px-6"
          >
            <div dangerouslySetInnerHTML={{ __html: article.html }} />

            {n.tags.length > 0 && (
              <div className="mt-12 pt-6 border-t border-line not-prose">
                <span className="font-mono text-label-xs text-muted tracking-[.16em] uppercase block mb-3">{t("detailPage.tags")}</span>
                <div className="flex flex-wrap gap-2">
                  {n.tags.map((tag) => (
                    <span key={tag} className="qs-tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-10 pt-6 border-t border-line not-prose">
              <Link href="/news" className="qs-btn qs-btn-ghost qs-btn-sm">← {t("related.viewAll")}</Link>
            </div>
          </article>

          {hasToc && (
            <aside className="border-l border-line pl-8 sticky top-32 hidden md:block">
              <div className="font-mono text-label-xs text-gold-1 tracking-[.18em] uppercase mb-4">[ {t("detail.toc")} ]</div>
              <ul className="list-none p-0 m-0 space-y-2.5">
                {article.toc.map((s) => (
                  <li key={s.id}><a href={`#${s.id}`} className="text-meta text-muted hover:text-ink leading-[1.4] block">{s.text}</a></li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </section>

      {/* RELATED */}
      <section className="py-12 sm:py-16 lg:py-24 bg-paper border-t border-line">
        <div className="max-w-wrap mx-auto px-5 sm:px-8 lg:px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-label text-gold-1 tracking-[.16em] uppercase">[ {t("related.label")} ]</span>
              <h2 className="qs-h2 mt-2">{t("related.heading")}</h2>
            </div>
            <Link className="qs-btn qs-btn-ghost qs-btn-sm" href="/news">{t("related.viewAll")}</Link>
          </div>
          <div
            id="related-news-rail"
            role="region"
            aria-label={t("related.heading")}
            tabIndex={0}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain
                       [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                       focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-1
                       md:grid md:grid-cols-3 md:overflow-visible"
          >
            {others.map(o => (
              <Link key={o.slug} href={`/news/${o.slug}`}
                    className="w-full shrink-0 snap-start bg-white border border-line flex flex-col
                               hover:-translate-y-0.5 hover:border-ink transition-[transform,border-color]
                               md:w-auto">
                {o.coverImage && (
                  <div className="aspect-[5/3] border-b border-line overflow-hidden relative">
                    <Image src={o.coverImage} alt={o.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                  </div>
                )}
                <div className="p-5 sm:p-7 flex flex-col flex-1">
                  <span className="font-mono text-label-xs text-gold-1 tracking-[.16em] uppercase">[ {o.cat} ]</span>
                  <h3 className="font-display font-semibold text-title leading-[1.35] tracking-[-.005em] mt-3 mb-3 flex-1">{o.title}</h3>
                  <div className="font-mono text-label-xs text-muted tracking-[.14em] pt-3.5 border-t border-line">{o.date}</div>
                </div>
              </Link>
            ))}
          </div>
          <RailNudge
            targetId="related-news-rail"
            label={t("related.swipeHint")}
            className="md:hidden"
          />
        </div>
      </section>
    </article>
  );
}
