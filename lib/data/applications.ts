import type { Locale } from "@/lib/i18n/config";
import { applications, type Application } from "@/data/applications";

// View contract consumed by pages + SEO helpers. Source is now the static
// `data/applications.ts` seed (single-language VI); EN reuses the same text.
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

function toView(row: Application, index: number): ApplicationView {
  return {
    slug: row.slug,
    title: row.machine,
    summary: row.summary,
    heroImage: null,
    workflow: row.workflow.map((s) => ({ n: s.n, label: s.label, title: s.title, desc: s.desc })),
    specs: row.specs.map((s) => ({ label: s.label, value: s.value })),
    deployments: row.deployments.map((d) => ({ name: d.name, loc: d.loc })),
    sort: index,
  };
}

export async function getApplicationBySlug(slug: string, _locale: Locale): Promise<ApplicationView | null> {
  const index = applications.findIndex((a) => a.slug === slug);
  return index === -1 ? null : toView(applications[index], index);
}

export async function getApplicationSlugs(): Promise<string[]> {
  return applications.map((a) => a.slug);
}
