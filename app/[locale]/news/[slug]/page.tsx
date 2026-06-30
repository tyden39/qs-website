import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAllNews, getNewsBySlug, getNewsSlugs } from "@/lib/data/news";
import { routing } from "@/lib/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildArticle, JsonLd } from "@/lib/seo/jsonld";
import type { Locale } from "@/lib/i18n/config";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://qstech.vn";

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
    alternates: buildAlternates(`/news/${slug}`),
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
    ALLOWED_ATTR: ["href", "src", "alt", "title", "rel", "target"],
    ALLOWED_URI_REGEXP: /^(?:(?:https?:|mailto:|\/)|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  });
}

export async function generateStaticParams() {
  const slugs = await getNewsSlugs();
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

type ArticleSection = {
  id: string;
  h: string;
  paras?: string[];
  quote?: { text: string; cite: string };
  after?: string[];
  list?: string[];
};

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

  // Share intents use the canonical, locale-aware article URL.
  const shareUrl = encodeURIComponent(`${APP_URL}${locale === "en" ? "/en" : ""}/news/${slug}`);
  const shareTitle = encodeURIComponent(n.title);
  const shareLinks = [
    { label: "FB", href: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}` },
    { label: "TW", href: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}` },
    { label: "LI", href: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}` },
  ];

  // Demo body shown only for the flagship article; localized from the `news.article` namespace.
  const articleBody = {
    intro: t("article.intro"),
    intro2: t("article.intro2"),
    sections: t.raw("article.sections") as ArticleSection[],
  };
  const metaRows: [string, string][] = [
    [t("meta.dateLabel"), n.date],
    [t("meta.authorLabel"), t("meta.author")],
    [t("meta.readTime"), t("detailPage.readValue")],
    [t("meta.category"), n.cat],
  ];

  return (
    <article>
      <JsonLd data={articleJsonLd} />
      {/* CRUMB */}
      <div className="bg-white border-b border-line py-3.5">
        <div className="max-w-wrap mx-auto px-12 flex items-center gap-2.5 font-mono text-[11px] text-muted tracking-[.12em] uppercase">
          <Link href="/" className="hover:text-ink">{t("breadcrumb.home")}</Link><span className="text-gold-1">/</span>
          <Link href="/news" className="hover:text-ink">{t("breadcrumb.news")}</Link><span className="text-gold-1">/</span>
          <Link href="/news" className="hover:text-ink">{n.cat}</Link><span className="text-gold-1">/</span>
          <span className="text-ink font-semibold">{n.title.slice(0, 40)}…</span>
        </div>
      </div>

      {/* HEAD */}
      <section className="py-16 pb-12 bg-white border-b border-line">
        <div className="max-w-wrap mx-auto px-12 grid md:grid-cols-[1fr_320px] gap-16 items-start">
          <div>
            <div className="flex gap-2 items-center">
              <span className="inline-block font-mono text-[10px] bg-gold text-ink-2 py-1 px-3 tracking-[.16em] uppercase font-semibold">[ {n.cat} ]</span>
              {isFlagship && <span className="inline-block font-mono text-[10px] bg-ink text-gold-2 py-1 px-3 tracking-[.16em] uppercase font-semibold">{t("detailPage.flagshipBadge")}</span>}
            </div>
            <h1 className="font-display font-bold tracking-[-.02em] leading-[1.1] text-balance mt-4.5 mb-6"
                style={{fontSize:"clamp(40px,5vw,60px)"}}>{n.title}</h1>
            <p className="text-lg leading-[1.7] text-[#3a3a3a] max-w-[65ch] text-pretty">{n.excerpt}</p>
          </div>
          <aside className="border border-line p-6 flex flex-col gap-4 bg-paper">
            {metaRows.map(([l,v]) => (
              <div key={l} className="flex flex-col gap-1">
                <span className="font-mono text-[9px] text-muted tracking-[.18em] uppercase">{l}</span>
                <span className="font-display text-sm font-semibold text-ink">{v}</span>
              </div>
            ))}
            <hr className="border-0 border-t border-line m-0"/>
            <div>
              <span className="font-mono text-[9px] text-muted tracking-[.18em] uppercase block mb-2">{t("meta.share")}</span>
              <div className="flex gap-2">
                {shareLinks.map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="w-8 h-8 border border-line grid place-items-center text-muted hover:text-ink hover:border-ink font-mono text-[10px]">{s.label}</a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* HERO IMG — real cover when available, schematic fallback otherwise */}
      <section className="bg-ink-2 border-b border-line">
        <div className="aspect-[21/9] relative overflow-hidden">
          {n.coverImage ? (
            <Image src={n.coverImage} alt={n.title} fill priority sizes="100vw" className="object-cover" />
          ) : (
            <svg viewBox="0 0 1200 514" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
              <rect width="1200" height="514" fill="#1a1815"/>
              <g fill="#3a3530"><rect x="120" y="80" width="400" height="354"/><rect x="540" y="80" width="240" height="354"/><rect x="800" y="80" width="280" height="354"/></g>
              <rect x="160" y="160" width="320" height="200" fill="#0a1a2a"/>
              <text x="200" y="220" fontFamily="JetBrains Mono,monospace" fontSize="22" fill="#e8c878">QS · 2026</text>
              <text x="200" y="260" fontFamily="JetBrains Mono,monospace" fontSize="40" fill="#fff" fontWeight="700">QS TECHNOLOGY</text>
              <circle cx="940" cy="260" r="40" fill="#c8553d"/>
              <circle cx="940" cy="260" r="18" fill="#e8c878"/>
            </svg>
          )}
          <div className="absolute left-0 right-0 bottom-0 px-6 py-3.5 text-[#cfc9b8] font-mono text-[10px] tracking-[.18em] uppercase"
               style={{background:"linear-gradient(0deg,rgba(10,10,8,.85),transparent)"}}>
            QS Technology · {n.cat} · {n.date}
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="py-20 bg-white">
        <div className="max-w-wrap mx-auto px-12 grid md:grid-cols-[1fr_240px] gap-20 items-start">
          <article className="text-base leading-[1.85] text-[#2a2520] max-w-[68ch]">
            {isFlagship ? (
              <>
                <p className="m-0 mb-6 text-pretty">{articleBody.intro}</p>
                <p className="m-0 mb-6 text-pretty">{articleBody.intro2}</p>

                {articleBody.sections.map(s => (
                  <div key={s.id}>
                    <h2 id={s.id} className="font-display font-bold text-[28px] tracking-[-.01em] leading-[1.2] mt-12 mb-4
                                              before:content-[''] before:block before:w-8 before:h-0.5 before:bg-gold-grad before:mb-3.5">
                      {s.h}
                    </h2>
                    {s.paras?.map((p, i) => <p key={i} className="m-0 mb-6">{p}</p>)}
                    {s.quote && (
                      <blockquote className="my-8 py-6 px-7 bg-paper border-l-[3px] border-gold-2 font-display italic text-lg text-ink leading-[1.5] m-0">
                        "{s.quote.text}"
                        <cite className="block mt-3.5 font-mono text-[11px] not-italic text-muted tracking-[.12em]">{s.quote.cite}</cite>
                      </blockquote>
                    )}
                    {s.after?.map((p, i) => <p key={i} className="m-0 mb-6">{p}</p>)}
                    {s.list && (
                      <ul className="list-none p-0 m-0 mb-6">
                        {s.list.map(item => (
                          <li key={item} className="py-2.5 pl-6 border-b border-line relative
                                                    before:content-['▸'] before:absolute before:left-1 before:top-2.5 before:text-gold-1 before:text-xs">
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

                {/* Tags */}
                <div className="mt-12 pt-6 border-t border-line">
                  <span className="font-mono text-[10px] text-muted tracking-[.16em] uppercase block mb-3">{t("detailPage.tags")}</span>
                  <div className="flex flex-wrap gap-2">
                    {n.tags.map(t => (
                      <span key={t} className="qs-tag">{t}</span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: safeHtml(n.bodyHtml) }}
              />
            )}
          </article>

          <aside className="border-l border-line pl-8 sticky top-32">
            <div className="font-mono text-[10px] text-gold-1 tracking-[.18em] uppercase mb-4">[ {t("detail.toc")} ]</div>
            <ul className="list-none p-0 m-0 space-y-2.5">
              {(isFlagship ? articleBody.sections : []).map(s => (
                <li key={s.id}><a href={`#${s.id}`} className="text-sm text-muted hover:text-ink leading-[1.4] block">{s.h}</a></li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      {/* RELATED */}
      <section className="py-20 bg-paper border-t border-line">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ {t("related.label")} ]</span>
              <h2 className="qs-h2 mt-2">{t("related.heading")}</h2>
            </div>
            <Link className="qs-btn qs-btn-ghost qs-btn-sm" href="/news">{t("related.viewAll")}</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {others.map(o => (
              <Link key={o.slug} href={`/news/${o.slug}`}
                    className="bg-white border border-line p-7 hover:-translate-y-0.5 hover:border-ink transition-all">
                <span className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">[ {o.cat} ]</span>
                <h3 className="font-display font-semibold text-lg leading-[1.35] tracking-[-.005em] mt-3 mb-3">{o.title}</h3>
                <div className="font-mono text-[10px] text-muted tracking-[.14em] pt-3.5 border-t border-line">{o.date}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
