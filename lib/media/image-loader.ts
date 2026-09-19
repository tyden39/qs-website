import manifest from "./image-manifest.json";
import { VARIANT_WIDTHS, variantPath } from "./image-variants";

/**
 * Custom `next/image` loader for the static export.
 *
 * With `output: "export"` there is no image optimizer at request time, so the
 * loader maps a requested width onto one of the WebP variants that
 * `scripts/generate-image-variants.ts` wrote at build time. Anything without a
 * variant — remote posters, PNG/SVG assets, images already small enough — is
 * returned untouched, which is exactly the previous `unoptimized` behaviour.
 *
 * Next calls this once per srcset entry, so returning the original for the top
 * rung is what makes the largest layouts keep full resolution.
 */
const intrinsicWidths = manifest as Record<string, number>;

export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }): string {
  const intrinsic = intrinsicWidths[src];
  if (!intrinsic) return src;

  const rung = VARIANT_WIDTHS.find((w) => w >= width && w < intrinsic);
  if (rung) return variantPath(src, rung);

  // No variant sits between the requested width and the original, so the
  // original is the right answer — tagged with the width it actually is. A
  // static host ignores the query, but it keeps every URL the loader returns
  // width-bearing: next/image probes the loader once per image and warns that
  // the loader "does not implement width" whenever the URL comes back byte-for-
  // byte identical to `src`. The tag is constant per image, so the top srcset
  // rungs still share one URL and one fetch.
  return `${src}?w=${intrinsic}`;
}
