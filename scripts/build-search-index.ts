#!/usr/bin/env tsx
/**
 * Build-time search index generator.
 *
 * Flattens every file-backed content type that has a page on the site —
 * controllers, catalogue units, drive/inverter series, CNC machines, downloads
 * (local files and the per-series document library), news, applications and
 * services — into a compact per-locale JSON the static client search reads at
 * runtime. No server runtime is involved: the JSON ships in `public/` and is
 * fetched same-origin by `search-results.tsx` and the header panel.
 *
 * Indexed text is text the visitor can actually see on the destination page, so
 * a hit always leads somewhere the query is visible. Copy that lives in the
 * message catalogue rather than the data files (download titles, machine spec
 * labels, service copy) is read straight from `messages/<locale>/*.json` — this
 * script runs outside next-intl, so there is no `t()` here.
 *
 * Output: public/search-index.<locale>.json (gitignored — regenerated on build).
 */
import fs from "node:fs";
import path from "node:path";
import { locales, type Locale } from "@/lib/i18n/config";
import { getAllProducts } from "@/lib/data/products";
import { getCatalogProducts } from "@/lib/data/catalog";
import { getAllNews } from "@/lib/data/news";
import { getAllDownloads } from "@/lib/data/downloads";
import type { DownloadFile } from "@/lib/data/downloads";
import { getApplicationSlugs, getApplicationBySlug } from "@/lib/data/applications";
import { getSeriesSlugs, getSeriesBySlug, toDocumentRows } from "@/lib/data/series";
import type { SeriesDetailView } from "@/lib/data/series";
import { getMachines } from "@/lib/data/machines";
import { getServiceSlugs } from "@/lib/data/services";
import { services, type Service } from "@/data/services";

import type { SearchRecord, SearchType } from "@/lib/search/types";
export type { SearchRecord, SearchType };

function clean(parts: (string | null | undefined)[]): string[] {
  return parts.map((p) => (p ?? "").trim()).filter(Boolean);
}

/** Read one locale's message namespace (this script runs outside next-intl). */
function messages(locale: Locale, namespace: string): Record<string, never> {
  const file = path.join(process.cwd(), `messages/${locale}/${namespace}.json`);
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

/**
 * Model codes a drive datasheet prints above its parameter tables, e.g.
 * "S3100A/E-4T***G/P". They are what a visitor types into the search box when
 * they have a nameplate in front of them, and they appear nowhere else in the
 * series record.
 */
function modelPatterns(detail: SeriesDetailView | null): string[] {
  if (!detail) return [];
  return detail.specSheet
    .filter((b) => b.kind === "paramTable")
    .map((b) => (b.kind === "paramTable" ? b.modelPattern : undefined))
    .filter((p): p is string => Boolean(p));
}

function buildForLocale(locale: Locale): SearchRecord[] {
  const records: SearchRecord[] = [];

  for (const p of getAllProducts(locale)) {
    records.push({
      id: `product-${p.slug}`,
      type: "product",
      title: p.name,
      excerpt: p.desc,
      href: `/electronics/${p.slug}`,
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

  for (const c of getCatalogProducts(locale)) {
    records.push({
      id: `product-${c.slug}`,
      type: "product",
      title: c.name,
      excerpt: c.desc,
      href: `/electronics/${c.slug}`,
      meta: clean([c.tag]),
      keywords: clean([
        c.name,
        c.tag,
        ...c.specs.map((s) => `${s.l} ${s.v}`),
        ...c.features.map((f) => f.title),
      ]).join(" "),
    });
  }

  // Servo / inverter / motor series. Their detail pages carry the drive
  // catalogue, so a nameplate query ("SDV3", "S3100A-4T") must reach them.
  const series = getSeriesSlugs()
    .map((slug) => getSeriesBySlug(slug, locale))
    .filter((s): s is NonNullable<typeof s> => s !== null);
  for (const s of series) {
    // The manufacturer's series code — the page's URL, the code its naming
    // diagram decodes, and the prefix on every one of its manuals. A QS-branded
    // name ("QS servo drive") hides it, so a nameplate query would otherwise
    // reach only the series' documents and never the series itself.
    const code = s.slug.toUpperCase();
    const named = s.name.toUpperCase().includes(code);
    records.push({
      id: `series-${s.slug}`,
      type: "product",
      title: s.name,
      excerpt: s.desc,
      href: `/electronics/${s.slug}`,
      meta: clean([s.brand, named ? null : code, s.tag]),
      keywords: clean([
        s.name,
        code,
        s.brand,
        s.tag,
        s.desc,
        s.detail?.naming?.code,
        ...modelPatterns(s.detail),
        ...s.specs.map((sp) => `${sp.l} ${sp.v}`),
        s.detail?.intro?.lead,
      ]).join(" "),
    });
  }

  const cnc = messages(locale, "cnc") as unknown as {
    machines: {
      axesUnit: string;
      categories: Record<string, string>;
      labels: Record<string, string>;
    };
  };
  for (const m of getMachines(locale)) {
    const categoryLabel = cnc.machines.categories[m.category];
    records.push({
      id: `machine-${m.slug}`,
      type: "machine",
      title: m.model,
      excerpt: m.tagline,
      href: `/machine-building/${m.slug}`,
      meta: clean([categoryLabel, `${m.axes} ${cnc.machines.axesUnit}`, m.controller]),
      keywords: clean([
        m.model,
        m.subtitle,
        m.tagline,
        categoryLabel,
        m.controller,
        ...m.specs.map((s) => `${cnc.machines.labels[s.k] ?? s.k} ${s.v}`),
        ...m.features.map((f) => f.title),
        ...m.useCases.map((u) => u.title),
        ...m.applications,
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

  // Localized labels for download titles, read straight from the messages file.
  // Mirrors the downloads page's own title logic.
  const dl = messages(locale, "downloads").index as unknown as {
    titles: Record<string, string>;
    docType: Record<string, string>;
    docGroup: Record<string, string>;
    lang: Record<string, string>;
    families: Record<string, { heading: string }>;
  };
  const titleOf = (d: DownloadFile): string => {
    if (d.titleKey) return dl.titles[d.titleKey];
    if (d.category === "operation" || d.category === "installation") {
      return `${d.model} — ${dl.docType[d.category]}`;
    }
    return d.model ?? "";
  };
  // Which product family each local file category is filed under in the tree.
  const familyOf: Record<DownloadFile["category"], string> = {
    catalogue: "catalogue",
    operation: "controllers",
    installation: "controllers",
    software: "software",
  };
  for (const d of getAllDownloads()) {
    const title = titleOf(d);
    records.push({
      id: `pdf-${d.slug}`,
      type: "pdf",
      title,
      excerpt: clean([dl.families[familyOf[d.category]].heading, dl.lang[d.lang]]).join(" · "),
      href: "/downloads",
      meta: clean([d.model, d.ext, d.version]),
      keywords: clean([title, d.model, d.category, d.productSlug, dl.lang[d.lang]]).join(" "),
    });
  }

  // The drive families' document library — manuals, drawings, brochures and
  // certificates listed under each series on the downloads tree. Split archives
  // occupy one row there and one record here, same as the page shows them.
  for (const s of series) {
    for (const [i, doc] of toDocumentRows(s.detail?.documentation ?? []).entries()) {
      records.push({
        id: `pdf-${s.slug}-${i}`,
        type: "pdf",
        title: doc.title,
        excerpt: clean([s.name, dl.docGroup[doc.category], dl.lang[doc.lang]]).join(" · "),
        href: "/downloads",
        meta: clean([s.name, doc.format.toUpperCase(), doc.size_mb ? `${doc.size_mb} MB` : null]),
        keywords: clean([
          doc.title,
          s.name,
          s.brand,
          dl.docGroup[doc.category],
          dl.lang[doc.lang],
        ]).join(" "),
      });
    }
  }

  // Application case studies. The short tab label comes from the message
  // catalogue, whose `items` order matches the seed order (the applications page
  // relies on the same pairing).
  const appLabels = (messages(locale, "application") as unknown as {
    index: { items: { t: string }[] };
  }).index.items;
  const appSlugs = getApplicationSlugs();
  for (const [i, slug] of appSlugs.entries()) {
    const a = getApplicationBySlug(slug, locale);
    if (!a) continue;
    const label = appLabels[i]?.t;
    records.push({
      id: `app-${a.slug}`,
      type: "app",
      title: a.title,
      excerpt: a.summary,
      href: `/applications/${a.slug}`,
      meta: clean([label]),
      keywords: clean([a.title, label, a.summary]).join(" "),
    });
  }

  // Services. The locale-aware copy in `service.detailData` is what the detail
  // page renders; the Vietnamese-only seed stands in where a translation is
  // missing, exactly as the page falls back.
  const serviceData = (messages(locale, "service") as unknown as {
    detailData?: Record<string, Service>;
  }).detailData;
  for (const slug of getServiceSlugs()) {
    const s = serviceData?.[slug] ?? services.find((x) => x.slug === slug);
    if (!s) continue;
    records.push({
      id: `service-${s.slug}`,
      type: "service",
      title: s.name,
      excerpt: s.lede,
      href: `/services/${s.slug}`,
      // Hero stats print as label + figure; the figure is the part worth a chip.
      meta: clean(s.stats.slice(0, 2).map(([, figure]) => figure)),
      keywords: clean([
        s.name,
        s.lede,
        ...s.process.map((p) => `${p.title} ${p.desc}`),
        ...s.includes.map((inc) => inc.name),
        ...s.packages.map((p) => `${p.name} ${p.title}`),
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
