#!/usr/bin/env tsx
/**
 * Build-time search index generator.
 *
 * Flattens the file-backed content (products, datasheets, news, applications,
 * service FAQs) into a compact per-locale JSON the static client search reads at
 * runtime. No server runtime is involved — the JSON ships in `public/` and is
 * fetched same-origin by `search-results.tsx`.
 *
 * Output: public/search-index.<locale>.json (gitignored — regenerated on build).
 */
import fs from "node:fs";
import path from "node:path";
import { locales, type Locale } from "@/lib/i18n/config";
import { getAllProducts } from "@/lib/data/products";
import { getAllNews } from "@/lib/data/news";
import { getAllDatasheets } from "@/lib/data/datasheets";
import { getApplicationSlugs, getApplicationBySlug } from "@/lib/data/applications";
import { getServiceSlugs, getServiceBySlug } from "@/lib/data/services";

export type SearchType = "product" | "pdf" | "news" | "app" | "faq";

export interface SearchRecord {
  id: string;
  type: SearchType;
  title: string;
  excerpt: string;
  href: string;
  meta: string[];
  // Space-joined searchable text (lower-weighted than title in the scorer).
  keywords: string;
}

function clean(parts: (string | null | undefined)[]): string[] {
  return parts.map((p) => (p ?? "").trim()).filter(Boolean);
}

function buildForLocale(locale: Locale): SearchRecord[] {
  const records: SearchRecord[] = [];

  for (const p of getAllProducts(locale)) {
    records.push({
      id: `product-${p.slug}`,
      type: "product",
      title: p.name,
      excerpt: p.desc,
      href: `/products/${p.slug}`,
      meta: clean([p.series, p.axes, p.display]),
      keywords: clean([
        p.name,
        p.tag,
        p.series,
        p.axes,
        p.display,
        ...p.bullets,
        ...p.specs.map((s) => `${s.l} ${s.v}`),
      ]).join(" "),
    });
  }

  for (const n of getAllNews(locale)) {
    records.push({
      id: `news-${n.slug}`,
      type: "news",
      title: n.title,
      excerpt: n.excerpt,
      href: `/news/${n.slug}`,
      meta: clean([n.cat, n.date]),
      keywords: clean([n.title, n.excerpt, n.cat, ...n.tags]).join(" "),
    });
  }

  for (const d of getAllDatasheets(locale)) {
    records.push({
      id: `pdf-${d.slug}`,
      type: "pdf",
      title: d.name,
      excerpt: clean([d.category, d.series]).join(" · "),
      href: "/downloads/datasheets",
      meta: clean([d.series, d.ext?.toUpperCase(), d.version]),
      keywords: clean([d.name, d.category, d.series, d.productSlug]).join(" "),
    });
  }

  for (const slug of getApplicationSlugs()) {
    const a = getApplicationBySlug(slug, locale);
    if (!a) continue;
    records.push({
      id: `app-${a.slug}`,
      type: "app",
      title: a.title,
      excerpt: a.summary,
      href: `/applications/${a.slug}`,
      meta: clean(a.deployments?.map((dep) => dep.name).slice(0, 2) ?? []),
      keywords: clean([
        a.title,
        a.summary,
        ...a.specs.map((s) => `${s.label} ${s.value}`),
      ]).join(" "),
    });
  }

  for (const slug of getServiceSlugs()) {
    const s = getServiceBySlug(slug, locale);
    if (!s) continue;
    s.faqs.forEach((f, i) => {
      records.push({
        id: `faq-${s.slug}-${i}`,
        type: "faq",
        title: f.q,
        excerpt: f.a,
        href: `/services/${s.slug}`,
        meta: clean([s.title]),
        keywords: clean([f.q, f.a, s.title]).join(" "),
      });
    });
  }

  return records;
}

function main() {
  const outDir = path.join(process.cwd(), "public");
  fs.mkdirSync(outDir, { recursive: true });

  for (const locale of locales) {
    const records = buildForLocale(locale);
    const outPath = path.join(outDir, `search-index.${locale}.json`);
    fs.writeFileSync(outPath, JSON.stringify(records), "utf8");
    const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
    console.log(`[search-index] ${locale}: ${records.length} records → ${outPath} (${kb} KB)`);
  }
}

main();
