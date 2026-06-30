import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "downloads" });
  return { title: t("meta.title") };
}

// Routing target stays static; localized text comes from the `downloads.index` namespace.
const categoryHrefs = ["/downloads/datasheets", "/downloads/datasheets", "/downloads/datasheets", "/downloads/datasheets"];

export default async function Downloads({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "downloads.index" });
  const categories = (
    t.raw("categories.items") as { lbl: string; type: string; t: string; d: string; cta: string }[]
  ).map((c, i) => ({ ...c, href: categoryHrefs[i] }));
  const featured = t.raw("featured.items") as { type: string; size: string; pages: string; title: string; sub: string; desc: string; code: string }[];
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line"
               style={{ background: "linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)" }}>
        <div className="absolute inset-0 qs-grid-bg opacity-50"></div>
        <div className="relative max-w-wrap mx-auto px-12 pt-12 pb-16">
          <div className="qs-crumb mb-8">
            <Link href="/">{t("breadcrumb.home")}</Link><span className="sep">/</span>
            <span className="here">{t("breadcrumb.current")}</span>
          </div>
          <div className="grid md:grid-cols-[1.1fr_1fr] gap-16 items-center">
            <div>
              <div className="qs-eyebrow">{t("hero.eyebrow")}</div>
              <h1 className="qs-h1 mt-3.5" style={{fontSize:"clamp(48px,6vw,84px)"}}>
                {t("hero.heading1")}<br/>
                <em className="not-italic font-semibold bg-gold-grad bg-clip-text text-transparent">{t("hero.headingEm")}</em><br/>{t("hero.heading3")}
              </h1>
              <p className="qs-lede mt-5 max-w-[55ch]">
                {t("hero.lede")}
              </p>

              {/* search */}
              <div className="mt-8 flex items-center bg-white border border-ink">
                <input className="flex-1 border-0 outline-0 px-6 py-4.5 text-[15px] bg-transparent"
                       placeholder={t("hero.searchPlaceholder")}/>
                <button className="bg-ink text-white border-0 px-6 py-4.5 font-mono text-[11px] tracking-[.16em] uppercase">{t("hero.searchBtn")}</button>
              </div>
            </div>

            {/* stack visual */}
            <div className="relative aspect-5/6 grid place-items-center">
              <div className="absolute w-3/5 aspect-8.5/11 bg-white border border-line -rotate-6 left-[10%] top-[15%]"></div>
              <div className="absolute w-3/5 aspect-8.5/11 bg-white border border-line rotate-3 left-[18%] top-[12%]"></div>
              <div className="relative w-3/5 aspect-8.5/11 bg-white border border-ink p-6 z-10">
                <div className="bg-ink h-2 w-1/3 mb-3"></div>
                <div className="h-1 bg-line w-2/3 mb-1.5"></div>
                <div className="h-1 bg-line w-3/4 mb-1.5"></div>
                <div className="h-1 bg-gold w-1/3 mb-4"></div>
                <div className="grid grid-cols-2 gap-1.5 mt-4">
                  {[1,2,3,4].map(i => <div key={i} className="aspect-square bg-paper border border-line"></div>)}
                </div>
                <div className="absolute bottom-3 right-3 font-mono text-[8px] tracking-[.16em] text-muted">QS · CATALOGUE · P. 01 / 64</div>
                <div className="absolute bottom-3 left-3 font-mono text-[8px] tracking-[.16em] text-muted">QS · F86 · P. 02</div>
                <div className="absolute top-3 right-3 font-mono text-[8px] tracking-[.16em] text-muted">P. 04</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-20 bg-white">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("categories.eyebrow")}</span>
              <h2 className="qs-h2 mt-2">{t("categories.heading")}</h2>
            </div>
            <span className="font-mono text-[11px] text-muted tracking-[.1em] uppercase">{t("categories.updated")}</span>
          </div>
          <div className="grid md:grid-cols-4 gap-px bg-line border border-line">
            {categories.map(c => (
              <Link key={c.t} href={c.href} className="bg-white p-6 flex flex-col gap-3.5 hover:bg-paper transition-colors relative
                                                  before:content-[''] before:absolute before:top-0 before:left-6 before:w-8 before:h-0.5 before:bg-gold">
                <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">[ {c.lbl} ]</div>
                <div className="self-start font-mono text-[10px] bg-ink text-white py-1 px-2 tracking-[.16em] uppercase font-semibold">{c.type}</div>
                <h3 className="font-display font-semibold text-[19px] tracking-[-.005em] m-0">{c.t}</h3>
                <p className="text-[13px] text-muted leading-[1.6] m-0 flex-1">{c.d}</p>
                <div className="font-mono text-[10px] text-ink tracking-[.12em] uppercase pt-3 mt-2 border-t border-line">{c.cta} →</div>{/* cta text is localized data */}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="py-20 bg-paper border-y border-line">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("featured.eyebrow")}</span>
              <h2 className="qs-h2 mt-2">{t("featured.heading")}</h2>
            </div>
            <Link className="qs-btn qs-btn-ghost qs-btn-sm" href="/downloads/datasheets">{t("featured.viewAll")}</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-line border border-line">
            {featured.map(f => (
              <div key={f.title} className="bg-white p-7 flex flex-col gap-3">
                <div className="flex gap-2">
                  <span className="font-mono text-[10px] bg-rust text-white py-1 px-2 tracking-[.14em] uppercase font-semibold">{f.type}</span>
                  <span className="font-mono text-[10px] text-muted tracking-[.14em] uppercase">{f.size}</span>
                  <span className="font-mono text-[10px] text-muted tracking-[.14em] uppercase">{f.pages}</span>
                </div>
                <h3 className="font-display font-semibold text-[19px] tracking-[-.005em] m-0 mt-1.5">
                  {f.title} <span className="block font-normal text-base text-muted">{f.sub}</span>
                </h3>
                <p className="text-[13px] text-[#4a4842] leading-[1.7] m-0 flex-1">{f.desc}</p>
                <div className="flex justify-between items-center pt-3.5 border-t border-line">
                  <span className="font-mono text-[10px] text-muted tracking-[.12em]">{f.code}</span>
                  <Link href="#" className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">{t("featured.download")}</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HELPERS */}
      <section className="py-20 bg-white">
        <div className="max-w-wrap mx-auto px-12 grid md:grid-cols-2 gap-6">
          <div className="border border-line p-8 relative
                          before:content-[''] before:absolute before:-top-px before:left-0 before:w-16 before:h-0.5 before:bg-gold-grad">
            <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">{t("plc.tag")}</div>
            <h3 className="font-display font-semibold text-[22px] tracking-[-.01em] mt-2.5 mb-3">{t("plc.heading")}</h3>
            <p className="text-sm text-[#4a4842] leading-[1.7] m-0 mb-6">{t("plc.body")}</p>
            <div className="flex gap-3">
              <Link className="qs-btn qs-btn-gold qs-btn-sm" href="/contact">{t("plc.register")}</Link>
            </div>
          </div>
          <div className="border border-line p-8 relative
                          before:content-[''] before:absolute before:-top-px before:left-0 before:w-16 before:h-0.5 before:bg-gold-grad">
            <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">{t("macro.tag")}</div>
            <h3 className="font-display font-semibold text-[22px] tracking-[-.01em] mt-2.5 mb-3">{t("macro.heading")}</h3>
            <p className="text-sm text-[#4a4842] leading-[1.7] m-0 mb-6">{t("macro.body")}</p>
            <div className="flex gap-3">
              <Link className="qs-btn qs-btn-gold qs-btn-sm" href="/contact">{t("macro.request")}</Link>
              <Link className="qs-btn qs-btn-ghost qs-btn-sm" href="/contact">{t("macro.contact")}</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
