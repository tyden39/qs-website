#!/usr/bin/env tsx
/**
 * Build-time search index generator.
 *
 * Flattens the file-backed content (products, downloads, news, applications,
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
import { getAllDownloads } from "@/lib/data/downloads";
import type { DownloadFile } from "@/lib/data/downloads";
import { getApplicationSlugs, getApplicationBySlug } from "@/lib/data/applications";

import type { SearchRecord, SearchType } from "@/lib/search/types";
export type { SearchRecord, SearchType };

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

  // Localized labels for download titles, read straight from the messages file
  // (the build script has no next-intl runtime). Mirrors the page's title logic.
  const dl = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), `messages/${locale}/downloads.json`), "utf8"),
  ).index;
  const titleOf = (d: DownloadFile): string => {
    if (d.titleKey) return dl.titles[d.titleKey];
    if (d.category === "operation" || d.category === "installation") {
      return `${d.model} — ${dl.docType[d.category]}`;
    }
    return d.model ?? "";
  };
  for (const d of getAllDownloads()) {
    const title = titleOf(d);
    records.push({
      id: `pdf-${d.slug}`,
      type: "pdf",
      title,
      excerpt: clean([dl.sections[d.category].heading, dl.lang[d.lang]]).join(" · "),
      href: "/downloads",
      meta: clean([d.model, d.ext, d.version]),
      keywords: clean([title, d.model, d.category, d.productSlug, dl.lang[d.lang]]).join(" "),
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
