import { services, type Service } from "@/data/services";
import type { Locale } from "@/lib/i18n/config";

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

// The service detail page renders primarily from the `data/services` seed
// directly; this view only needs to supply slugs (static params) and metadata
// fields (hero.subhead / title) it reads.
function toView(s: Service): ServiceView {
  return {
    slug: s.slug,
    title: s.name,
    hero: {
      headline: `${s.hero.line1} ${s.hero.line2} ${s.hero.emphasis}`.replace(/\s+/g, " ").trim(),
      subhead: s.lede,
      ctaPrimary: null,
      ctaSecondary: null,
    },
    stats: s.stats.map(([value, label]) => ({ label, value })),
    intro: s.includesIntro,
    process: s.process.map((p) => ({ num: p.num, day: p.day, title: p.title, desc: p.desc, duration: p.duration })),
    included: s.includes,
    faqs: s.faqs,
    tiers: s.packages.map((p) => ({
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

export function getServiceBySlug(slug: string, _locale: Locale): ServiceView | null {
  const s = services.find((x) => x.slug === slug);
  return s ? toView(s) : null;
}

export function getServiceSlugs(): string[] {
  return services.map((s) => s.slug);
}
