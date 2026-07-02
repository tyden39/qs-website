import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchPanel, { type FeaturedProduct } from "@/components/SearchPanel";
import FloatingContact from "@/components/floating-contact";
import { getAllProducts } from "@/lib/data/products";
import { routing } from "@/lib/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildOrganization, buildWebSite, JsonLd } from "@/lib/seo/jsonld";

const descriptions: Record<string, string> = {
  vi: "Thiết kế và sản xuất bộ điều khiển CNC, servo, board mở rộng tại Việt Nam. Hỗ trợ trực tiếp tại 35 tỉnh thành, bảo hành 24 tháng.",
  en: "Design and manufacture CNC controllers, servo drives, and expansion boards in Vietnam. Direct support across 35 provinces, 24-month warranty.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const description = descriptions[locale] ?? descriptions.vi;
  return {
    description,
    alternates: buildAlternates("/"),
    openGraph: {
      locale: locale === "en" ? "en_US" : "vi_VN",
      description,
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const products = getAllProducts(locale);
  const featured: FeaturedProduct[] = products.slice(0, 6).map((p) => ({
    slug: p.slug,
    name: p.name,
    meta: `${p.axes} · ${p.display}`,
    tag: p.tag,
    img: p.image.src,
  }));

  return (
    <NextIntlClientProvider>
      <JsonLd data={buildOrganization()} />
      <JsonLd data={buildWebSite()} />
      <Header />
      <SearchPanel featured={featured} productCount={products.length} />
      {children}
      <Footer />
      <FloatingContact />
    </NextIntlClientProvider>
  );
}
