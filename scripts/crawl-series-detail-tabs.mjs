#!/usr/bin/env node
/**
 * Crawl savch's English (en.savch.net) series detail pages and replace their
 * tab galleries + document lists in data/series.json.
 *
 * Each detail page exposes five tabs (Overview / Parameters / Video / Download /
 * Options). The video tab is always empty; the other four are:
 *   - Overview    → detail.introduction    (image strip)
 *   - Parameters  → detail.paramImages     (spec-sheet images, shown under Specs tab)
 *   - Download    → detail.documentation   (download links; URLs kept, files not mirrored)
 *   - Options     → detail.accessoryImages (image strip)
 *
 * The English plates are used for both locales (vi/en) — the src is the same
 * file, only the alt text differs. Gallery images are downloaded and re-hosted
 * locally as WebP under public/img/products/series/{slug}/{section}/NN.webp.
 * Documents keep their en.savch.net URL (catalogue only, no mirroring).
 *
 * Usage: node scripts/crawl-series-detail-tabs.mjs
 */

import * as fs from "fs/promises";
import * as path from "path";
import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import sharp from "sharp";

const PROJECT_ROOT = path.resolve(".");
const SERIES_JSON = path.join(PROJECT_ROOT, "data", "series.json");
const IMG_ROOT = path.join(PROJECT_ROOT, "public", "img", "products", "series");
const ORIGIN = "https://en.savch.net";

// One detail URL per series entry, taken from savch's English site so the
// mirrored plates read in English for both locales. Re-running does a full
// replace of a series' detail from its source (galleries + documentation),
// dropping any earlier hand-authored blocks — filter TARGETS before a run so
// only the intended series are rebuilt.
const TARGETS = [
  { slug: "sdv3", url: "https://en.savch.net/SDV3Economicservo/55.html", name: "SDV3" },
  { slug: "sda2", url: "https://en.savch.net/SDA2Generalservo/57.html", name: "SDA2" },
  { slug: "s600", url: "https://en.savch.net/S600EConpactdrive/8.html", name: "S600/E" },
  { slug: "s3100", url: "https://en.savch.net/S3100AEGeneraldrive/53.html", name: "S3100A/E" },
];

// Restrict this run to a subset of slugs via CRAWL_ONLY="slug1,slug2".
const ONLY = (process.env.CRAWL_ONLY ?? "").split(",").map((s) => s.trim()).filter(Boolean);

const VI_SECTION = { intro: "giới thiệu", params: "thông số", accessories: "phụ kiện" };
const EN_SECTION = { intro: "introduction", params: "specification", accessories: "accessory" };

function log(msg) {
  process.stdout.write(msg + "\n");
}

async function fetchDoc(url) {
  const res = await fetch(url, { timeout: 30000 });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  return new JSDOM(html).window.document;
}

/** The five tab panels sit in order inside .product-deatilsbox. */
function tabBoxes(doc) {
  const wrap = doc.querySelector("div.product-deatilsbox");
  if (!wrap) return [];
  return Array.from(wrap.querySelectorAll(":scope > div.mdeatils-box"));
}

function absUrl(src) {
  if (!src) return null;
  if (src.startsWith("http")) return src;
  return ORIGIN + (src.startsWith("/") ? src : "/" + src);
}

function imageUrls(box) {
  if (!box) return [];
  return Array.from(box.querySelectorAll("img"))
    .map((img) => absUrl(img.getAttribute("src")))
    .filter(Boolean);
}

/** Download one image and re-encode to WebP; returns { src, w, h } or null. */
async function saveImage(url, slug, section, index, retries = 2) {
  const rel = `/img/products/series/${slug}/${section}/${String(index + 1).padStart(2, "0")}.webp`;
  const dest = path.join(PROJECT_ROOT, "public", rel.replace(/^\//, ""));

  // Idempotent: reuse an already-downloaded file, just re-read its dimensions.
  try {
    const meta = await sharp(dest).metadata();
    return { src: rel, w: meta.width, h: meta.height };
  } catch {
    /* not downloaded yet */
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { timeout: 30000 });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await fs.mkdir(path.dirname(dest), { recursive: true });
      const out = await sharp(buf).webp({ quality: 86 }).toFile(dest);
      return { src: rel, w: out.width, h: out.height };
    } catch (err) {
      if (attempt === retries) {
        log(`      ✗ image failed (${url.split("/").pop()}): ${err.message}`);
        return null;
      }
    }
  }
  return null;
}

async function saveGallery(urls, slug, section, name) {
  const photos = [];
  for (let i = 0; i < urls.length; i++) {
    const saved = await saveImage(urls[i], slug, section, i);
    if (!saved) continue;
    photos.push({
      src: saved.src,
      w: saved.w,
      h: saved.h,
      alt: `${name} — ${VI_SECTION[section]} ${String(i + 1).padStart(2, "0")}`,
      altEn: `${name} — ${EN_SECTION[section]} ${String(i + 1).padStart(2, "0")}`,
    });
  }
  return photos;
}

function extractDocs(box) {
  if (!box) return [];
  const docs = [];
  for (const section of box.querySelectorAll("div.solution-list")) {
    const header = section.querySelector("h4.sol-title");
    let category = "manual";
    if (header) {
      const t = header.textContent.toLowerCase();
      if (t.includes("drawing")) category = "drawing";
      else if (t.includes("soft")) category = "software";
      else if (t.includes("color")) category = "brochure";
      else if (t.includes("certificate")) category = "certificate";
    }
    for (const li of section.querySelectorAll("li.li2")) {
      const link = li.querySelector("a.file-name");
      const href = link?.getAttribute("href");
      const title = link?.textContent.trim();
      if (!href || !title) continue;
      let format = "pdf";
      if (href.endsWith(".rar")) format = "rar";
      else if (href.endsWith(".zip")) format = "zip";
      const sizeStr = li.querySelector("span.file-time")?.textContent ?? "";
      const m = sizeStr.match(/([\d.]+)\s*MB/i);
      docs.push({
        title,
        category,
        lang: "en",
        url: absUrl(href),
        format,
        ...(m ? { size_mb: parseFloat(m[1]) } : {}),
      });
    }
  }
  return docs;
}

async function main() {
  const raw = JSON.parse(await fs.readFile(SERIES_JSON, "utf-8"));
  const bySlug = Object.fromEntries(raw.map((s) => [s.slug, s]));

  for (const target of TARGETS) {
    if (ONLY.length && !ONLY.includes(target.slug)) continue;
    log(`\n=== ${target.slug} — ${target.url}`);
    const series = bySlug[target.slug];
    if (!series) {
      log(`  ✗ series "${target.slug}" not in series.json — skipped`);
      continue;
    }

    let doc;
    try {
      doc = await fetchDoc(target.url);
    } catch (err) {
      log(`  ✗ fetch failed: ${err.message}`);
      continue;
    }

    const boxes = tabBoxes(doc);
    if (boxes.length < 5) {
      log(`  ✗ expected 5 tab panels, found ${boxes.length} — skipped`);
      continue;
    }

    const introUrls = imageUrls(boxes[0]);
    const paramUrls = imageUrls(boxes[1]);
    const accUrls = imageUrls(boxes[4]);
    const docs = extractDocs(boxes[3]);

    log(`  intro:${introUrls.length} params:${paramUrls.length} accessories:${accUrls.length} docs:${docs.length}`);

    const introduction = await saveGallery(introUrls, target.slug, "intro", target.name);
    const paramImages = await saveGallery(paramUrls, target.slug, "params", target.name);
    const accessoryImages = await saveGallery(accUrls, target.slug, "accessories", target.name);

    // Full replace: the series detail becomes only the English source galleries
    // + download list, dropping any earlier hand-authored blocks (naming/intro/
    // tables/figures/spec sheets). `tables` stays required-but-empty.
    const detail = { tables: [] };
    if (introduction.length) detail.introduction = introduction;
    if (paramImages.length) detail.paramImages = paramImages;
    if (accessoryImages.length) detail.accessoryImages = accessoryImages;
    if (docs.length) detail.documentation = docs;
    series.detail = detail;
    series.sourceUrl = target.url;

    log(`  ✓ replaced: intro ${introduction.length} · params ${paramImages.length} · accessories ${accessoryImages.length} · docs ${docs.length}`);
  }

  await fs.writeFile(SERIES_JSON, JSON.stringify(raw, null, 2) + "\n", "utf-8");
  log(`\n✓ wrote ${SERIES_JSON}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
