import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getMachineBySlug, getMachineSlugs } from "@/lib/data/machines";
import LineMachineDetail from "../_components/line-machine-detail";
import MachineDatasheet from "../_components/machine-datasheet";
import { routing } from "@/lib/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildMachine, buildTrail, JsonLd } from "@/lib/seo/jsonld";
import type { Locale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const m = getMachineBySlug(slug, locale);
  if (!m) return {};
  const t = await getTranslations({ locale, namespace: "cnc" });
  const title = `${m.model} — ${t(`machines.categories.${m.category}`)}`;
  return {
    title,
    description: m.tagline,
    alternates: buildAlternates(`/mechatronics/${slug}`, locale),
    openGraph: {
      title,
      description: m.tagline,
      type: "website",
      locale: locale === "en" ? "en_US" : "vi_VN",
      url: `/mechatronics/${slug}`,
      images: [{ url: m.image.src, width: m.image.w, height: m.image.h, alt: m.model }],
    },
    twitter: { card: "summary_large_image", title, description: m.tagline },
  };
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getMachineSlugs().map((slug) => ({ locale, slug })),
  );
}

export default async function MachineDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const machine = getMachineBySlug(slug, locale);
  if (!machine) notFound();

  const t = await getTranslations({ locale, namespace: "cnc" });
  const categoryLabel = t(`machines.categories.${machine.category}`);
  const breadcrumb = buildTrail(locale, t("breadcrumb.home"), [
    { name: t("breadcrumb.current"), path: "/mechatronics" },
    { name: machine.model, path: `/mechatronics/${slug}` },
  ]);

  // Line-integrated machines (bottle rotator, checkweigher...) ship process-flow
  // data and render the light "line station" template; the CNC machines render
  // the full editorial datasheet.
  return (
    <>
      <JsonLd data={buildMachine(machine, categoryLabel, locale)} />
      <JsonLd data={breadcrumb} />
      {machine.line.length > 0 ? (
        <LineMachineDetail machine={machine} locale={locale} />
      ) : (
        <MachineDatasheet machine={machine} locale={locale} />
      )}
    </>
  );
}
