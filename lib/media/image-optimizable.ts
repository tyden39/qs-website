import imageLoader from "./image-loader";

/**
 * Mirrors `images.imageSizes` / `images.deviceSizes` in `next.config.mjs`.
 * Kept in sync by hand: the config is plain JS loaded before any TypeScript is
 * transpiled, so it cannot import from here.
 */
const IMAGE_SIZES = [256, 384];
const DEVICE_SIZES = [640, 768, 960, 1400];

/** The widths Next will ask the loader for, mirroring its own srcset builder. */
function candidateWidths(width: number | undefined, hasSizes: boolean): number[] {
  // With `sizes`, Next offers the browser every rung and lets it choose.
  if (hasSizes) return [...IMAGE_SIZES, ...DEVICE_SIZES];

  // Without `sizes`, Next emits a 1x/2x pair snapped up to the device sizes.
  const w = width ?? 400;
  const snap = (target: number) => DEVICE_SIZES.find((d) => d >= target) ?? DEVICE_SIZES[DEVICE_SIZES.length - 1];
  return [snap(w), snap(w * 2)];
}

/**
 * True when the variant ladder can actually serve this image more than one file.
 *
 * Small assets (a 320px logo, a 96px material swatch), PNGs and remote posters
 * have no smaller copy on disk, so the loader returns the same URL for every
 * width Next asks about. Running them through the loader anyway produces a
 * srcset whose entries all point at the same file — noise that says nothing.
 * Marking them `unoptimized` renders a plain `<img>` with a single src instead.
 */
export function hasUsableVariants(src: string, width: number | undefined, hasSizes: boolean): boolean {
  if (!src.startsWith("/")) return false;
  const urls = new Set(candidateWidths(width, hasSizes).map((w) => imageLoader({ src, width: w })));
  return urls.size > 1;
}
