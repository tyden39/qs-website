import type { Metadata } from "next";
import "../globals.css";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchPanel, { type FeaturedProduct } from "@/components/SearchPanel";
import FloatingContact from "@/components/floating-contact";
import { LightboxProvider } from "@/components/media/image-lightbox";
import { getAllProducts } from "@/lib/data/products";
import { routing } from "@/lib/i18n/routing";
import type { Locale } from "@/lib/i18n/config";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildOrganization, buildWebSite, JsonLd } from "@/lib/seo/jsonld";

const sans = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-sans" });
const display = Inter_Tight({ subsets: ["latin", "vietnamese"], variable: "--font-display" });
// Mono is only used for small labels (eyebrows, spec keys, meta) — never an LCP
// candidate — so it is not preloaded and does not compete with the hero image
// for bandwidth during the LCP window.
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", preload: false });

// This layout owns <html>/<body> so `lang` reflects the active locale (the
// root app/layout.tsx is a pass-through). The `/` path is redirected to `/vi/`
// by Cloudflare `_redirects` at the edge, with app/page.tsx as the prerendered
// fallback for local dev and direct origin hits.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: requested } = await params;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: "seo" });
  const description = t("siteDescription");
  return {
    // metadataBase is inherited from the root layout.
    title: {
      default: t("defaultOgAlt"),
      template: `%s | ${t("siteName")}`,
    },
    description,
    alternates: buildAlternates("/", locale as Locale),
    openGraph: {
      siteName: "QS Technology",
      type: "website",
      locale: locale === "en" ? "en_US" : "vi_VN",
      description,
    },
    twitter: {
      card: "summary_large_image",
      site: "@qstechnology",
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

  const t = await getTranslations("common");
  const lightboxLabels = {
    prev: t("lightbox.prev"),
    next: t("lightbox.next"),
    close: t("lightbox.close"),
    zoomIn: t("lightbox.zoomIn"),
    zoomOut: t("lightbox.zoomOut"),
    zoomReset: t("lightbox.zoomReset"),
  };

  const products = getAllProducts(locale);
  const featured: FeaturedProduct[] = products.slice(0, 5).map((p) => ({
    slug: p.slug,
    name: p.name,
    meta: `${p.axes} · ${p.display}`,
    tag: p.tag,
    img: p.image.src,
  }));

  return (
    <html lang={locale} className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <head>
        <noscript>
          {/* Keep scroll-reveal content visible when JS is disabled. */}
          <style>{`.qs-reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <NextIntlClientProvider>
          <JsonLd data={buildOrganization()} />
          <JsonLd data={buildWebSite()} />
          <LightboxProvider labels={lightboxLabels}>
            <Header />
            <SearchPanel featured={featured} productCount={products.length} />
            {children}
            <Footer />
            <FloatingContact />
          </LightboxProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
