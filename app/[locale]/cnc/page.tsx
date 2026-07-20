import type { Metadata } from "next";
import { Link } from "@/lib/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Reveal from "@/components/reveal";
import CircuitTraces from "@/components/circuit-traces";
import MachineAnnotation from "./_components/machine-annotation";
import CncFeatureVideo from "./_components/cnc-feature-video";
import MachineList from "./_components/machine-list";
import { getMachines } from "@/lib/data/machines";
import { buildAlternates } from "@/lib/seo/alternates";
import type { Locale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cnc" });
  const title = t("seo.title");
  const description = t("seo.description");
  return {
    title,
    description,
    alternates: buildAlternates("/cnc", locale),
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "en" ? "en_US" : "vi_VN",
      url: "/cnc",
      images: [{ url: "/home/cnc-machine-hero.webp", width: 1672, height: 941, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

// Static, non-translated fields (assets, numbers, routing) — localized text is
// merged in from the `cnc` namespace by position, mirroring the home page.
const MACHINE_IMG = "/home/cnc-machine-hero.webp";
const VIDEO_ID = "kLcNpeHu-2A";

export default async function CncPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "cnc" });

  const machines = getMachines(locale);

  return (
    <>
      {/* HERO — dark machine hall: thesis copy + annotated machine figure (the page signature) */}
      <section className="relative bg-ink text-[#cfc9b8] overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-[.1]" aria-hidden="true"></div>
        <CircuitTraces variant="dark" className="absolute inset-y-0 left-[-8%] w-[46%] opacity-[.4] [mask-image:radial-gradient(ellipse_at_left,#000_20%,transparent_66%)] [-webkit-mask-image:radial-gradient(ellipse_at_left,#000_20%,transparent_66%)]" />
        <div className="qs-glow" style={{ top: "-140px", right: "18%", width: "420px", height: "420px" }} aria-hidden="true"></div>
        <div className="relative qs-wrap-wide py-16 lg:py-24 grid lg:grid-cols-[minmax(400px,1fr)_1.35fr] gap-12 lg:gap-16 items-center">
          <Reveal>
            <h1 className="qs-h1 text-white">
              <span className="block">
                <em className="not-italic font-semibold qs-gold-shimmer">{t("hero.heading1")}</em>
              </span>
              <span className="block">{t("hero.heading2")}</span>
            </h1>
            <p className="text-[#a8a499] text-base leading-[1.7] mt-6 max-w-[54ch]">{t("hero.lede")}</p>
          </Reveal>
          <Reveal delay={120}>
            <MachineAnnotation
              img={MACHINE_IMG}
              alt={t("hero.imgAlt")}
              zoomLabel={t("machines.detail.galleryZoom")}
            />
          </Reveal>
        </div>
      </section>

      {/* MACHINE LINE-UP — browse the CNC machines QS manufactures */}
      <section className="relative py-24 bg-paper border-t border-line overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true"></div>
        <CircuitTraces variant="light" className="hidden md:block absolute top-0 right-0 w-[38%] h-[70%] opacity-[.5] [mask-image:radial-gradient(ellipse_at_top_right,#000_24%,transparent_70%)] [-webkit-mask-image:radial-gradient(ellipse_at_top_right,#000_24%,transparent_70%)]" />
        <div className="relative qs-wrap-wide">
          <Reveal>
            <div className="pb-7 border-b border-line mb-12 max-w-[70ch]">
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase inline-flex items-center gap-2"><span className="qs-live-dot"></span>{t("machines.eyebrow")}</span>
              <h2 className="qs-h2 mt-3">{t("machines.heading")}</h2>
              <p className="text-[15px] leading-[1.7] text-muted mt-4 m-0">{t("machines.body")}</p>
            </div>
          </Reveal>
          <Reveal>
            <MachineList machines={machines} />
          </Reveal>
        </div>
      </section>

      {/* VIDEO — the machine cutting on camera */}
      <section className="relative bg-ink text-[#cfc9b8] py-24 overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-[.1]" aria-hidden="true"></div>
        <CircuitTraces variant="dark" className="absolute inset-y-0 right-[-8%] w-[48%] opacity-[.4] [mask-image:radial-gradient(ellipse_at_right,#000_20%,transparent_66%)] [-webkit-mask-image:radial-gradient(ellipse_at_right,#000_20%,transparent_66%)]" />
        <div className="qs-glow" style={{ bottom: "-160px", left: "20%", width: "440px", height: "440px" }} aria-hidden="true"></div>
        <div className="relative qs-wrap-wide">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-7 border-b border-[#2a2620] mb-12">
              <div>
                <span className="font-mono text-[11px] text-gold-2 tracking-[.16em] uppercase inline-flex items-center gap-2"><span className="qs-live-dot"></span>{t("video.eyebrow")}</span>
                <h2 className="qs-h2 text-white mt-3">{t("video.heading")}</h2>
                <p className="text-[#a8a499] text-[15px] leading-[1.7] mt-4 max-w-[64ch] m-0">{t("video.body")}</p>
              </div>
              <a className="qs-btn bg-transparent text-white border border-[#4a453a] hover:bg-white/10 qs-btn-sm shrink-0" href="https://youtube.com/@qstechnology7516" target="_blank" rel="noopener noreferrer">{t("video.youtube")} <span className="arr">→</span></a>
            </div>
          </Reveal>
          <Reveal>
            <div className="max-w-[980px] mx-auto">
              <CncFeatureVideo youtubeId={VIDEO_ID} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA — closing consultation band */}
      <section className="relative py-24 bg-paper overflow-hidden">
        <div className="absolute inset-0 qs-grid-bg qs-grid-drift opacity-60" aria-hidden="true"></div>
        <CircuitTraces variant="light" className="hidden md:block absolute top-0 left-0 w-[36%] h-[70%] opacity-[.5] [mask-image:radial-gradient(ellipse_at_top_left,#000_24%,transparent_70%)] [-webkit-mask-image:radial-gradient(ellipse_at_top_left,#000_24%,transparent_70%)]" />
        <div className="relative qs-wrap-wide max-w-[880px] text-center">
          <Reveal>
            <h2 className="qs-h2">{t("cta.heading")}</h2>
            <p className="qs-lede mx-auto mt-5">{t("cta.body")}</p>
            <div className="flex flex-wrap justify-center gap-3 mt-9">
              <Link className="qs-btn qs-btn-gold" href="/contact">{t("cta.button")} <span className="arr">→</span></Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
