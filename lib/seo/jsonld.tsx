import type {
  Organization,
  WebSite,
  Product,
  Article,
  TechArticle,
  Service,
  FAQPage,
  BreadcrumbList,
  WithContext,
  SearchAction,
  Thing,
} from "schema-dts";
import type { ProductView } from "@/lib/data/products";
import type { CatalogProductView } from "@/lib/data/catalog";
import type { SeriesView } from "@/lib/data/series";
import type { NewsView } from "@/lib/data/news";
import type { ApplicationView } from "@/lib/data/applications";
import type { ServiceView } from "@/lib/data/services";
import type { MachineView } from "@/lib/data/machines";
import type { Locale } from "@/lib/i18n/config";
import { APP_URL, localeUrl } from "@/lib/seo/app-url";

export function buildOrganization(): WithContext<Organization> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "QS Technology",
    url: APP_URL,
    logo: `${APP_URL}/logo-st-full.png`,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+84-909-663-350",
        contactType: "customer service",
        areaServed: "VN",
        availableLanguage: ["Vietnamese", "English"],
      },
      {
        "@type": "ContactPoint",
        telephone: "+84-922-322-338",
        contactType: "customer service",
        areaServed: "VN",
        availableLanguage: ["Vietnamese", "English"],
      },
    ],
    address: {
      "@type": "PostalAddress",
      addressCountry: "VN",
      addressLocality: "Hà Nội",
    },
    sameAs: ["https://youtube.com/@qstechnology7516"],
  };
}

export function buildWebSite(): WithContext<WebSite> {
  const searchAction: SearchAction = {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${APP_URL}/vi/search/?q={search_term_string}`,
    },
    // schema-dts uses string literals for action inputs
    "query-input": "required name=search_term_string",
  } as SearchAction;

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "QS Technology",
    url: APP_URL,
    potentialAction: searchAction,
    inLanguage: ["vi", "en"],
  };
}

export function buildProduct(p: ProductView, locale: Locale): WithContext<Product> {
  const images = p.images.map((i) => i.url);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.desc,
    sku: p.slug,
    brand: {
      "@type": "Brand",
      name: "QS Technology",
    },
    image: images.length > 0 ? images : [`${APP_URL}/og-default.png`],
    url: localeUrl(`/electronics/${p.slug}`, locale),
    // No `offers`: the site publishes no prices, and an Offer without `price` is
    // invalid — Google rejects the whole Product node rather than ignoring the
    // Offer. Quote-only products are better served by a valid priceless Product.
  };
}

/**
 * Catalogue items (DNC units, accessories) render through a lighter template
 * than the controllers but are still physical goods, so they carry the same
 * priceless `Product` node. Their single catalogue photo may be a site-relative
 * path, so it is resolved to an absolute URL the same way machines are.
 */
export function buildCatalogProduct(p: CatalogProductView, locale: Locale): WithContext<Product> {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.desc,
    sku: p.slug,
    brand: {
      "@type": "Brand",
      name: "QS Technology",
    },
    image: p.image.src.startsWith("http") ? p.image.src : `${APP_URL}${p.image.src}`,
    url: localeUrl(`/electronics/${p.slug}`, locale),
    // No `offers`: quote-only catalogue, same rationale as buildProduct.
  };
}

/**
 * Drive-line series (servo drives/motors/cables, inverters) are sold at series
 * level, so the Product node describes the whole series rather than a single
 * part number — `sku` carries the series slug. Same priceless, quote-only shape
 * as the other Product builders. A series without a hero photo yet (cables) falls
 * back to the site default OG image.
 */
export function buildSeriesProduct(s: SeriesView, locale: Locale): WithContext<Product> {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: s.name,
    description: s.desc,
    sku: s.slug,
    brand: {
      "@type": "Brand",
      name: "QS Technology",
    },
    image: s.image
      ? (s.image.src.startsWith("http") ? s.image.src : `${APP_URL}${s.image.src}`)
      : `${APP_URL}/og-default.png`,
    url: localeUrl(`/electronics/${s.slug}`, locale),
    // No `offers`: quote-only catalogue, same rationale as buildProduct.
  };
}

/**
 * Machines are physical goods like the controllers, so they share the Product
 * type — and the same priceless shape, since machine pricing is quote-only.
 * `category` maps to the localized machine category so the node carries the
 * machine class, not just a model number.
 */
export function buildMachine(m: MachineView, categoryLabel: string, locale: Locale): WithContext<Product> {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: m.model,
    description: m.tagline,
    sku: m.slug,
    category: categoryLabel,
    brand: {
      "@type": "Brand",
      name: "QS Technology",
    },
    image: m.image.src.startsWith("http") ? m.image.src : `${APP_URL}${m.image.src}`,
    url: localeUrl(`/machine-building/${m.slug}`, locale),
  };
}

export function buildArticle(n: NewsView, locale: Locale): WithContext<Article> {
  const url = localeUrl(`/news/${n.slug}`, locale);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: n.title,
    description: n.excerpt?.slice(0, 160),
    image: n.coverImage ?? `${APP_URL}/og-default.png`,
    url,
    datePublished: n.publishedAt?.toISOString() ?? undefined,
    dateModified: n.publishedAt?.toISOString() ?? undefined,
    author: {
      "@type": "Organization",
      name: "QS Technology",
    },
    publisher: {
      "@type": "Organization",
      name: "QS Technology",
      logo: {
        "@type": "ImageObject",
        url: `${APP_URL}/logo-st-full.png`,
      },
    },
    inLanguage: locale,
  };
}

export function buildTechArticle(a: ApplicationView, locale: Locale): WithContext<TechArticle> {
  const url = localeUrl(`/applications/${a.slug}`, locale);
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: a.title,
    description: a.summary?.slice(0, 160),
    url,
    image: a.heroImage
      ? (a.heroImage.startsWith("http") ? a.heroImage : `${APP_URL}${a.heroImage}`)
      : `${APP_URL}/og-default.png`,
    author: {
      "@type": "Organization",
      name: "QS Technology",
    },
    publisher: {
      "@type": "Organization",
      name: "QS Technology",
      logo: {
        "@type": "ImageObject",
        url: `${APP_URL}/logo-st-full.png`,
      },
    },
    inLanguage: locale,
  };
}

export function buildService(s: ServiceView, locale: Locale): WithContext<Service> {
  const url = localeUrl(`/services/${s.slug}`, locale);
  // schema-dts ServiceLeaf lacks inLanguage; cast via unknown to satisfy strict types
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.title,
    description: s.hero.subhead?.slice(0, 160),
    url,
    provider: {
      "@type": "Organization",
      name: "QS Technology",
    },
    areaServed: {
      "@type": "Country",
      name: "Vietnam",
    },
  } as unknown as WithContext<Service>;
}

export function buildFAQPage(faqs: { q: string; a: string }[]): WithContext<FAQPage> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };
}

export function buildBreadcrumbList(
  items: { name: string; url: string }[],
): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Breadcrumb trail from locale-relative paths, resolving each crumb through
 * `localeUrl` so every `item` equals that page's canonical. Callers pass paths
 * ("/electronics"), never absolute URLs — hand-built URLs are how the trail drifts
 * out of sync with the canonical. The home crumb is prepended automatically.
 */
export function buildTrail(
  locale: Locale,
  homeName: string,
  crumbs: { name: string; path: string }[],
): WithContext<BreadcrumbList> {
  return buildBreadcrumbList([
    { name: homeName, url: localeUrl("/", locale) },
    ...crumbs.map((c) => ({ name: c.name, url: localeUrl(c.path, locale) })),
  ]);
}

/** Lightweight server component — renders structured data script tag. */
export function JsonLd({ data }: { data: WithContext<Thing> }): React.ReactElement {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
