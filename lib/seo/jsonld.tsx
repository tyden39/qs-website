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
import type { NewsView } from "@/lib/data/news";
import type { ApplicationView } from "@/lib/data/applications";
import type { ServiceView } from "@/lib/data/services";
import type { Locale } from "@/lib/i18n/config";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://qstcnc.com";

export function buildOrganization(): WithContext<Organization> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "QS Technology",
    url: APP_URL,
    logo: `${APP_URL}/logo-st-full.png`,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+84-24-3997-6688",
      contactType: "customer service",
      areaServed: "VN",
      availableLanguage: ["Vietnamese", "English"],
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "VN",
      addressLocality: "Hà Nội",
    },
    sameAs: [],
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
    url: `${APP_URL}/${locale}/products/${p.slug}/`,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "VND",
      seller: {
        "@type": "Organization",
        name: "QS Technology",
      },
    },
  };
}

export function buildArticle(n: NewsView, locale: Locale): WithContext<Article> {
  const url = `${APP_URL}/${locale}/news/${n.slug}/`;
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
  const url = `${APP_URL}/${locale}/applications/${a.slug}/`;
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
  const url = `${APP_URL}/${locale}/services/${s.slug}/`;
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

/** Lightweight server component — renders structured data script tag. */
export function JsonLd({ data }: { data: WithContext<Thing> }): React.ReactElement {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
