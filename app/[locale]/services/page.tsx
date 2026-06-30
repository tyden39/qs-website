import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
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
  const title = t("servicesTitle");
  const description = t("servicesDescription");
  return {
    title,
    description,
    alternates: buildAlternates("/services"),
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "en" ? "en_US" : "vi_VN",
      url: "/services",
      images: [{ url: "/og-default.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function Service({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "service.index" });
  const seo = await getTranslations({ locale, namespace: "seo" });
  // Placeholder copy — real content supplied later.
  const lorem = t("lorem");
  const machineStrip = t.raw("machineStrip") as string[];
  const specs = t.raw("fabrication.specs") as [string, string][];
  const details = t.raw("fabrication.details") as string[];
  const breadcrumb = buildBreadcrumbList([
    { name: t("breadcrumb.home"), url: `${APP_URL}${locale === "en" ? "/en" : ""}` },
    { name: seo("servicesTitle"), url: `${APP_URL}${locale === "en" ? "/en" : ""}/services` },
  ]);
  return (
    <>
      <JsonLd data={breadcrumb} />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line"
               style={{ background: "linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)" }}>
        <div className="absolute inset-0 qs-grid-bg opacity-50"></div>
        <div className="relative max-w-wrap mx-auto px-12 pt-12 pb-16">
          <div className="qs-crumb mb-8">
            <Link href="/">{t("breadcrumb.home")}</Link><span className="sep">/</span>
            <span className="here">{t("breadcrumb.current")}</span>
          </div>
          <div className="qs-eyebrow">{t("eyebrow")}</div>
          <h1 className="qs-h1 mt-3.5" style={{ fontSize: "clamp(48px,6vw,84px)" }}>
            {t("heading1")}<br/>
            <em className="not-italic font-semibold bg-gold-grad bg-clip-text text-transparent">{t("heading2")}</em>
          </h1>
          <p className="qs-lede mt-6 max-w-[64ch]">{lorem}</p>

          {/* machine image strip */}
          <div className="mt-12 grid sm:grid-cols-3 gap-6">
            {machineStrip.map((label) => (
              <Frame key={label} label={label} className="aspect-[4/3]" />
            ))}
          </div>
        </div>
      </section>

      {/* THÔNG TIN DỰ ÁN CHẾ TẠO */}
      <section className="py-24 bg-white">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("fabrication.eyebrow")}</span>
              <h2 className="qs-h2 mt-2">{t("fabrication.heading")}</h2>
            </div>
            <span className="font-mono text-[11px] text-muted tracking-[.1em] uppercase">{t("fabrication.tag")}</span>
          </div>

          <div className="grid md:grid-cols-[1fr_1.15fr] gap-12 items-start">
            <Frame label={t("fabrication.frameLabel")} className="aspect-[4/5]" />

            <div>
              <h3 className="font-display font-bold text-[26px] tracking-[-.01em] uppercase m-0">
                {t("fabrication.projectTitle")}
              </h3>

              <div className="mt-7">
                <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase mb-3">{t("fabrication.specsLabel")}</div>
                <ul className="list-none p-0 m-0">
                  {specs.map(([l, v]) => (
                    <li key={l} className="grid grid-cols-[1fr_auto] gap-4 items-baseline border-b border-line py-2.5 last:border-b-0">
                      <span className="text-sm text-[#4a4842]">{l}</span>
                      <span className="font-display text-[15px] font-semibold text-ink">{v}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-[15px] leading-[1.75] text-[#3a3a3a] mt-7 mb-3.5">{lorem}</p>
              <p className="text-[15px] leading-[1.75] text-[#3a3a3a] m-0">{lorem}</p>
            </div>
          </div>

          {/* detail images */}
          <div className="grid sm:grid-cols-2 gap-6 mt-10">
            {details.map((label) => (
              <Frame key={label} label={label} className="aspect-[16/9]" />
            ))}
          </div>
        </div>
      </section>

      {/* DỊCH VỤ NÂNG CẤP MÁY */}
      <section className="py-24 bg-paper border-y border-line">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("upgrade.eyebrow")}</span>
              <h2 className="qs-h2 mt-2">{t("upgrade.heading")}</h2>
            </div>
            <span className="font-mono text-[11px] text-muted tracking-[.1em] uppercase">{t("upgrade.tag")}</span>
          </div>

          <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-6 items-center">
            <div>
              <div className="font-mono text-[11px] text-muted tracking-[.18em] uppercase text-center mb-3">{t("upgrade.before")}</div>
              <Frame label={t("upgrade.beforeFrame")} className="aspect-[3/4]" />
            </div>
            <div className="hidden sm:flex items-center justify-center text-gold-1 text-2xl pt-7" aria-hidden>→</div>
            <div>
              <div className="font-mono text-[11px] text-ink tracking-[.18em] uppercase text-center mb-3">{t("upgrade.after")}</div>
              <Frame label={t("upgrade.afterFrame")} className="aspect-[3/4]" />
            </div>
          </div>

          <p className="text-[15px] leading-[1.75] text-[#3a3a3a] max-w-[80ch] mt-10 m-0">{lorem}</p>
        </div>
      </section>

      {/* MÔ TẢ YÊU CẦU */}
      <section className="py-24 bg-white" id="quote">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">{t("form.eyebrow")}</span>
              <h2 className="qs-h2 mt-2">{t("form.heading")}</h2>
            </div>
          </div>

          <form className="bg-paper border border-line p-8 max-w-[820px]">
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label={t("form.name")} name="name" />
              <Field label={t("form.phone")} name="phone" type="tel" />
              <Field label={t("form.email")} name="email" type="email" />
            </div>
            <div className="mt-5">
              <label className="block">
                <span className="block font-mono text-[10px] text-muted tracking-[.16em] uppercase mb-1.5">{t("form.content")}</span>
                <textarea name="message" rows={6}
                          className="w-full border border-line bg-white px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors resize-y" />
              </label>
            </div>
            <div className="flex justify-end mt-5">
              <button type="submit" className="qs-btn qs-btn-gold justify-center">{t("form.submit")}</button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

function Frame({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`qs-img-ph ${className}`} role="img" aria-label={label}>
      <span className="px-4 text-center">{label}</span>
    </div>
  );
}

function Field({ label, name, type = "text" }: { label: string; name: string; type?: string }) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] text-muted tracking-[.16em] uppercase mb-1.5">{label}</span>
      <input name={name} type={type} className="w-full border border-line bg-white px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors" />
    </label>
  );
}
