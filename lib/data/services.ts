import { services, type Service } from "@/data/services";
import type { Locale } from "@/lib/i18n/config";

/**
 * A service reduced to what the site actually consumes: the slug (static
 * params) plus the two fields the JSON-LD carries. The detail page renders from
 * the locale-aware `service.detailData` copy in the message catalogue and
 * overrides `title` / `hero.subhead` with it before building the JSON-LD, so no
 * other field needs resolving here.
 */
export type ServiceView = {
  slug: string;
  title: string;
  hero: { subhead: string };
};

function toView(s: Service): ServiceView {
  return { slug: s.slug, title: s.name, hero: { subhead: s.lede } };
}

export function getServiceBySlug(slug: string, _locale: Locale): ServiceView | null {
  const s = services.find((x) => x.slug === slug);
  return s ? toView(s) : null;
}

export function getServiceSlugs(): string[] {
  return services.map((s) => s.slug);
}
