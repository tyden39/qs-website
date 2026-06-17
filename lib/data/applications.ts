import { applications, type Application } from "@/data/applications";
import type { Locale } from "@/lib/i18n/config";

export type ApplicationView = {
  slug: string;
  title: string;
  summary: string;
  heroImage: string | null;
  workflow: { n: string; label: string; title: string; desc: string }[];
  specs: { label: string; value: string }[];
  deployments: { name: string; loc: string }[];
  sort: number;
};

function toView(a: Application, index: number): ApplicationView {
  return {
    slug: a.slug,
    title: a.machine,
    summary: a.summary,
    heroImage: null,
    workflow: a.workflow,
    specs: a.specs,
    deployments: a.deployments,
    sort: index,
  };
}

export function getApplicationBySlug(slug: string, _locale: Locale): ApplicationView | null {
  const index = applications.findIndex((a) => a.slug === slug);
  return index === -1 ? null : toView(applications[index], index);
}

export function getApplicationSlugs(): string[] {
  return applications.map((a) => a.slug);
}
