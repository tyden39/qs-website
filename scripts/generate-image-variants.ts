/**
 * Pre-renders the responsive WebP variants that the custom next/image loader
 * points at, and writes the manifest telling the loader which ones exist.
 *
 * Static export means `next/image` cannot resize anything at request time, so
 * without this step every device downloads the full-resolution original — a
 * 1400px product shot on a 390px phone. Run from `prebuild`/`predev`.
 *
 * Output lives next to each source (`foo.webp` -> `foo-640w.webp`) and is
 * gitignored; only the manifest is committed so a clean checkout typechecks.
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { VARIANT_PATTERN, VARIANT_WIDTHS, variantPath } from "../lib/media/image-variants";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const MANIFEST_FILE = path.join(process.cwd(), "lib", "media", "image-manifest.json");

/** Re-encode quality for the downscaled copies. The originals are never touched. */
const QUALITY = 82;

/** Bounded fan-out: sharp is native and CPU-bound, so unbounded work just thrashes. */
const CONCURRENCY = 8;

async function listSourceImages(dir: string, out: string[] = []): Promise<string[]> {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await listSourceImages(full, out);
    else if (/\.webp$/i.test(entry.name) && !VARIANT_PATTERN.test(entry.name)) out.push(full);
  }
  return out;
}

/** True when the variant is missing or older than its source. */
async function isStale(source: string, variant: string): Promise<boolean> {
  try {
    const [src, dst] = await Promise.all([fs.stat(source), fs.stat(variant)]);
    return dst.mtimeMs < src.mtimeMs;
  } catch {
    return true;
  }
}

type Result = { src: string; width: number; written: number; bytes: number };

async function processImage(file: string): Promise<Result | null> {
  const rel = `/${path.relative(PUBLIC_DIR, file).split(path.sep).join("/")}`;
  const { width } = await sharp(file).metadata();
  if (!width) return null;

  // Nothing to gain from a variant that is not actually smaller than the source.
  const widths = VARIANT_WIDTHS.filter((w) => w < width);
  if (widths.length === 0) return null;

  let written = 0;
  let bytes = 0;
  for (const w of widths) {
    const dest = path.join(PUBLIC_DIR, variantPath(rel, w).slice(1));
    if (await isStale(file, dest)) {
      await sharp(file).resize({ width: w }).webp({ quality: QUALITY, effort: 5 }).toFile(dest);
      written++;
    }
    bytes += (await fs.stat(dest)).size;
  }
  return { src: rel, width, written, bytes };
}

async function mapWithLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const i = cursor++;
        results[i] = await fn(items[i]);
      }
    }),
  );
  return results;
}

async function main() {
  const files = await listSourceImages(PUBLIC_DIR);
  const results = (await mapWithLimit(files, CONCURRENCY, processImage)).filter(Boolean) as Result[];

  // src -> intrinsic width. The loader derives the available rungs from it, which
  // keeps the client payload to one number per image instead of a width array.
  const manifest: Record<string, number> = {};
  for (const r of results.sort((a, b) => a.src.localeCompare(b.src))) manifest[r.src] = r.width;
  await fs.writeFile(MANIFEST_FILE, `${JSON.stringify(manifest, null, 0)}\n`);

  const written = results.reduce((a, r) => a + r.written, 0);
  const kb = (n: number) => `${Math.round(n / 1024)} KB`;
  console.log(
    `[image-variants] ${results.length}/${files.length} images have variants ` +
      `(${written} re-encoded this run, ${kb(results.reduce((a, r) => a + r.bytes, 0))} of variants on disk)`,
  );
}

main().catch((err) => {
  console.error("[image-variants] failed:", err);
  process.exit(1);
});
