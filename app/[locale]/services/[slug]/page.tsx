import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { services, type Service } from "@/data/services";
import { getServiceBySlug, getServiceSlugs } from "@/lib/data/services";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildService, buildFAQPage, JsonLd } from "@/lib/seo/jsonld";
import type { Locale } from "@/lib/i18n/config";

export async function generateStaticParams() {
  // Combine static slugs from data file with DB slugs
  const dbSlugs = await getServiceSlugs();
  const staticSlugs = services.map((s) => s.slug);
  const allSlugs = Array.from(new Set([...staticSlugs, ...dbSlugs]));
  return allSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  // Try DB first, then localized static content, then the raw static data file.
  const dbService = await getServiceBySlug(slug, locale);
  const tData = await getTranslations({ locale, namespace: "service.detailData" });
  const localized = tData.has(slug) ? (tData.raw(slug) as Service) : undefined;
  const staticService = services.find((x) => x.slug === slug);
  const title = dbService?.title ?? localized?.name ?? staticService?.name ?? slug;
  const description =
    dbService?.hero.subhead?.slice(0, 160) ??
    localized?.lede?.slice(0, 160) ??
    staticService?.lede?.slice(0, 160) ??
    "";
  return {
    title,
    description,
    alternates: buildAlternates(`/services/${slug}`),
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "en" ? "en_US" : "vi_VN",
      url: `/services/${slug}`,
      images: [{ url: "/og-default.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ServiceDetail({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "service.detailPage" });
  const tData = await getTranslations({ locale, namespace: "service.detailData" });
  // Prefer the locale-aware content; fall back to the raw static data file.
  const s: Service | undefined = tData.has(slug)
    ? (tData.raw(slug) as Service)
    : services.find(x => x.slug === slug);
  if (!s) notFound();

  // Fetch DB service for structured data (may be null if not yet in DB)
  const dbService = await getServiceBySlug(slug, locale);
  const serviceJsonLd = dbService ? buildService(dbService, locale) : null;
  const faqJsonLd =
    dbService && dbService.faqs.length > 0
      ? buildFAQPage(dbService.faqs)
      : null;

  return (
    <>
      {serviceJsonLd && <JsonLd data={serviceJsonLd} />}
      {faqJsonLd && <JsonLd data={faqJsonLd} />}
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line"
               style={{ background: "linear-gradient(180deg, #fafaf7, #f0eee8)", padding: "48px 0 64px" }}>
        <div className="absolute inset-0 qs-grid-bg opacity-50"></div>
        <div className="relative max-w-wrap mx-auto px-12">
          <div className="grid md:grid-cols-[1.2fr_1fr] gap-16 items-start">
            <div>
              <nav className="qs-crumb">
                <Link href="/">{t("breadcrumb.home")}</Link><span className="sep">/</span>
                <Link href="/services">{t("breadcrumb.services")}</Link><span className="sep">/</span>
                <span className="here">{s.name}</span>
              </nav>
              <div className="qs-eyebrow mt-3">Service · {s.number}</div>
              <h1 className="font-display font-bold mt-4 leading-[.98] tracking-[-.025em]"
                  style={{ fontSize: "clamp(48px, 6vw, 80px)" }}>
                {s.hero.line1}<br/>
                {s.hero.line2} <em className="not-italic bg-gold-grad bg-clip-text text-transparent">{s.hero.emphasis}</em><br/>
                {t("heroLine3")}
              </h1>
              <p className="text-[17px] leading-[1.7] text-[#3a3a3a] max-w-[55ch] mt-6">{s.lede}</p>
              <div className="flex gap-3 mt-7">
                <Link className="qs-btn qs-btn-gold" href="/contact">{t("surveyBtn")}</Link>
                <Link className="qs-btn qs-btn-ghost" href="#pricing">{t("pricingBtn")}</Link>
              </div>
              <div className="mt-9 grid grid-cols-3 gap-8 pt-6 border-t border-line">
                {s.stats.map(([l, v]) => (
                  <div key={l} className="font-mono text-[10px] text-muted tracking-[.16em] uppercase">
                    {l}
                    <b className="block font-display text-[22px] font-bold tracking-[-.01em] normal-case text-ink mt-1">{v}</b>
                  </div>
                ))}
              </div>
            </div>

            <div className="aspect-[5/6] bg-white border border-line p-[18px] relative">
              <div className="absolute inset-2.5 border border-dashed border-gold opacity-30 pointer-events-none"></div>
              <svg viewBox="0 0 400 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <defs>
                  <linearGradient id="sd-m1" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#e8e6e0"/><stop offset="1" stopColor="#a8a499"/></linearGradient>
                  <linearGradient id="sd-m2" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#3a3530"/><stop offset="1" stopColor="#1a1815"/></linearGradient>
                </defs>
                <text x="40" y="42" fontFamily="JetBrains Mono,monospace" fontSize="10" letterSpacing="2" fill="#8a6f35">BEFORE · 2008</text>
                <rect x="40" y="60" width="320" height="160" fill="url(#sd-m2)" stroke="#5a5650"/>
                <rect x="60" y="80" width="220" height="100" fill="#0a1a2a" opacity=".5"/>
                <text x="74" y="108" fontFamily="JetBrains Mono,monospace" fontSize="9" fill="#5a5650">FANUC 0i-MD</text>
                <text x="74" y="138" fontFamily="JetBrains Mono,monospace" fontSize="14" fontWeight="700" fill="#7a7570">DEPRECATED</text>
                <g fill="#2a2520">
                  <rect x="290" y="80" width="20" height="20"/><rect x="314" y="80" width="20" height="20"/><rect x="338" y="80" width="20" height="20"/>
                  <rect x="290" y="104" width="20" height="20"/><rect x="314" y="104" width="20" height="20"/><rect x="338" y="104" width="20" height="20"/>
                </g>
                <text x="200" y="252" fontFamily="JetBrains Mono,monospace" fontSize="22" letterSpacing="6" fill="#c9a35a" textAnchor="middle">↓</text>
                <text x="40" y="282" fontFamily="JetBrains Mono,monospace" fontSize="10" letterSpacing="2" fill="#8a6f35">AFTER · QS F86</text>
                <rect x="40" y="300" width="320" height="160" fill="url(#sd-m1)" stroke="#5a5650" strokeWidth="2"/>
                <rect x="60" y="320" width="220" height="100" fill="#0a1a2a"/>
                <text x="74" y="348" fontFamily="JetBrains Mono,monospace" fontSize="10" fill="#5ab8e0">QS · F86 · ETHERCAT</text>
                <text x="74" y="378" fontFamily="JetBrains Mono,monospace" fontSize="18" fontWeight="700" fill="#fff">RUN 14:32</text>
                <text x="74" y="402" fontFamily="JetBrains Mono,monospace" fontSize="11" fill="#e8c878">FEED 1820 mm/min</text>
                <g fill="#3a3530">
                  <rect x="290" y="320" width="20" height="20"/><rect x="314" y="320" width="20" height="20"/><rect x="338" y="320" width="20" height="20"/>
                  <rect x="290" y="344" width="20" height="20"/><rect x="314" y="344" width="20" height="20"/><rect x="338" y="344" width="20" height="20"/>
                </g>
                <circle cx="350" cy="395" r="14" fill="#c8553d"/>
              </svg>
              <div className="absolute left-[18px] bottom-3.5 font-mono text-[9px] tracking-[.16em] text-muted">FIG. 01 · RETROFIT · BEFORE / AFTER</div>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-24 bg-white">
        <div className="max-w-wrap mx-auto px-12">
          <div className="mb-10 pb-4 border-b border-line">
            <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("processEyebrow")}</span>
            <h2 className="qs-h2 mt-1.5 max-w-[24ch]">{t("processHeading")}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-line border border-line relative">
            {s.process.map(step => (
              <div key={step.num} className="bg-white px-[22px] py-7 flex flex-col gap-2.5 relative z-[2]">
                <div className={`w-10 h-10 grid place-items-center font-display font-bold text-lg mb-2
                                 ${step.active ? "bg-ink text-gold-2 border-2 border-ink" : "bg-white text-ink border-2 border-ink"}`}>
                  {step.num}
                </div>
                <span className="font-mono text-[10px] text-gold-1 tracking-[.14em] uppercase">{step.day}</span>
                <h3 className="font-display text-[17px] font-semibold leading-[1.3] tracking-[-.005em] m-0 mt-1">{step.title}</h3>
                <p className="text-[#4a4842] text-[13px] leading-[1.6] m-0 mt-1.5">{step.desc}</p>
                <div className="font-mono text-[10px] text-muted tracking-[.1em] pt-3 border-t border-line mt-auto">{step.duration}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INCLUDES */}
      <section className="py-24 bg-paper border-t border-line">
        <div className="max-w-wrap mx-auto px-12 grid md:grid-cols-[1fr_1.2fr] gap-16 items-start">
          <div>
            <span className="qs-eyebrow">{t("includesEyebrow")}</span>
            <h2 className="font-display text-[32px] font-bold tracking-[-.015em] mt-2 mb-4 leading-[1.1]">
              {t("includesHeading")}
            </h2>
            {s.includesIntro.map((p, i) => (
              <p key={i} className="text-[15px] leading-[1.75] text-[#3a3a3a] m-0 mb-4">{p}</p>
            ))}
          </div>
          <div className="bg-white border border-line">
            {s.includes.map((item, i) => (
              <div key={i} className={`grid grid-cols-[auto_1fr_auto] gap-[18px] px-[22px] py-[18px] items-center
                                       ${i < s.includes.length - 1 ? "border-b border-line" : ""}`}>
                <div className={`w-[22px] h-[22px] grid place-items-center text-xs shrink-0
                                 ${item.has ? "bg-ink text-gold-2" : "bg-paper-2 text-muted"}`}>
                  {item.has ? "✓" : "—"}
                </div>
                <div className="font-display font-semibold text-[15px]">
                  {item.name}
                  <small className="block font-mono text-[11px] text-muted font-normal mt-1 normal-case tracking-[.06em]">{item.note}</small>
                </div>
                <div className="font-mono text-[10px] text-gold-1 tracking-[.14em] uppercase bg-paper px-2 py-1 border border-line">
                  {item.tag}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-24 bg-white" id="pricing">
        <div className="max-w-wrap mx-auto px-12">
          <div className="text-center mb-10">
            <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("pricingEyebrow")}</span>
            <h2 className="qs-h2 mt-1.5">{t("pricingHeading")}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-line border border-line">
            {s.packages.map(pkg => (
              <div key={pkg.title}
                   className={`p-8 flex flex-col gap-3.5 relative
                               ${pkg.featured ? "bg-ink text-[#cfc9b8]" : "bg-white"}
                               before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px]
                               ${pkg.featured ? "before:bg-gold-grad" : "before:bg-line"}`}>
                <span className={`font-mono text-[11px] tracking-[.16em] ${pkg.featured ? "text-gold-2" : "text-gold-1"}`}>{pkg.name}</span>
                <h3 className={`font-display text-2xl font-bold tracking-[-.01em] m-0 ${pkg.featured ? "text-white" : ""}`}>{pkg.title}</h3>
                <div className={`py-3.5 border-b ${pkg.featured ? "border-[#2a2620]" : "border-line"}`}>
                  <b className={`font-display text-[32px] font-bold tracking-[-.015em] ${pkg.featured ? "text-white" : "text-ink"}`}>{pkg.price}</b>
                  <small className={`block text-xs mt-1 ${pkg.featured ? "text-[#a8a499]" : "text-muted"}`}>{pkg.priceNote}</small>
                </div>
                <ul className="list-none p-0 m-0 flex flex-col gap-2 flex-1">
                  {pkg.features.map(f => (
                    <li key={f} className={`text-[13px] leading-[1.55] pl-[22px] relative
                                            ${pkg.featured ? "text-[#cfc9b8] before:text-gold-2" : "text-[#2a2a2a] before:text-gold-1"}
                                            before:content-['✓'] before:absolute before:left-0 before:top-0 before:font-bold before:text-[13px]`}>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link className={`qs-btn ${pkg.featured ? "qs-btn-gold" : "qs-btn-ghost"} mt-3 justify-center`} href="/contact">{pkg.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-paper border-t border-line">
        <div className="max-w-wrap mx-auto px-12">
          <div className="mb-6 pb-4 border-b border-line">
            <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("faqEyebrow", { name: s.name })}</span>
            <h2 className="font-display text-[28px] font-bold tracking-[-.01em] mt-1.5">{t("faqHeading", { name: s.name.toLowerCase() })}</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-px bg-line border border-line">
            {s.faqs.map((f, i) => (
              <div key={i} className="bg-white px-[26px] py-6 flex flex-col gap-2">
                <span className="font-mono text-[11px] text-gold-1 tracking-[.14em]">[ Q.{String(i + 1).padStart(2, "0")} ]</span>
                <h4 className="font-display text-base font-semibold tracking-[-.005em] leading-[1.35] m-0 mt-1.5">{f.q}</h4>
                <p className="m-0 text-[#3a3a3a] text-[13.5px] leading-[1.65]">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-wrap mx-auto px-12">
          <div className="bg-ink text-[#cfc9b8] p-12 grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <h3 className="font-display font-bold text-[28px] text-white tracking-[-.01em] m-0">{s.cta.title}</h3>
              <p className="text-[#a8a499] mt-2 max-w-[60ch] m-0 text-sm">{s.cta.desc}</p>
            </div>
            <Link className="qs-btn qs-btn-gold" href="/contact">{t("ctaBtn")}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
