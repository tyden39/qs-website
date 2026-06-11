import type { Locale } from "@/lib/i18n/config";
import { services, type Service } from "@/data/services";

// View contract consumed by SEO/metadata helpers. The services detail page
// renders from the `data/services.ts` seed directly; this seam maps the same
// seed into the View shape so metadata + JSON-LD stay DB-free.
export type ServiceView = {
  slug: string;
  title: string;
  hero: { headline: string; subhead: string; ctaPrimary: string | null; ctaSecondary: string | null };
  stats: { label: string; value: string }[];
  intro: string[];
  process: { num: number; day: string; title: string; desc: string; duration: string }[];
  included: { has: boolean; name: string; note: string; tag: string }[];
  faqs: { q: string; a: string }[];
  tiers: { name: string; title: string; price: string; priceNote: string; features: string[]; cta: string; featured: boolean }[];
};

function toView(row: Service): ServiceView {
  return {
    slug: row.slug,
    title: row.name,
    hero: {
      headline: `${row.hero.line1} ${row.hero.emphasis} ${row.hero.line2}`.trim(),
      subhead: row.lede,
      ctaPrimary: null,
      ctaSecondary: null,
    },
    stats: row.stats.map(([label, value]) => ({ label, value })),
    intro: row.includesIntro,
    process: row.process.map((p) => ({
      num: p.num,
      day: p.day,
      title: p.title,
      desc: p.desc,
      duration: p.duration,
    })),
    included: row.includes.map((i) => ({ has: i.has, name: i.name, note: i.note, tag: i.tag })),
    faqs: row.faqs,
    tiers: row.packages.map((p) => ({
      name: p.name,
      title: p.title,
      price: p.price,
      priceNote: p.priceNote,
      features: p.features,
      cta: p.cta,
      featured: p.featured ?? false,
    })),
  };
}

export async function getServiceBySlug(slug: string, _locale: Locale): Promise<ServiceView | null> {
  const row = services.find((s) => s.slug === slug);
  return row ? toView(row) : null;
}

export async function getServiceSlugs(): Promise<string[]> {
  return services.map((s) => s.slug);
}
