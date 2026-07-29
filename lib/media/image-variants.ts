/**
 * Width ladder for the pre-rendered responsive variants under `public/`.
 *
 * The site is a static export, so there is no server to resize on demand: every
 * width a browser can pick has to exist as a file on disk before deploy. The
 * rungs span the full range the layouts ask for — 256/384 for the spec-sheet
 * and gallery thumbnails, 640/768/960 for cards and phone-width heroes — with
 * the untouched original (mostly 1400px) as the top rung for wide layouts.
 *
 * The small rungs matter more than they look: product shots are tall (some are
 * 1400x2734), so even a 640px-wide copy is a six-figure byte count behind a
 * 64px thumbnail.
 */
export const VARIANT_WIDTHS = [256, 384, 640, 768, 960] as const;

/** File suffix a variant gets: `foo.webp` at 640 becomes `foo-640w.webp`. */
export const variantPath = (src: string, width: number) =>
  src.replace(/\.webp$/i, `-${width}w.webp`);

/** Matches a generated variant, so the generator never recurses over its own output. */
export const VARIANT_PATTERN = /-\d+w\.webp$/i;
