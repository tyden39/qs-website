import { getPublicImageSize } from "./image-size";
import { VARIANT_WIDTHS, variantPath } from "./image-variants";

/**
 * Article bodies are stored as crawled HTML, so their pictures never pass
 * through `next/image` and miss everything it would have added. This restores
 * the same three wins on the raw `<img>` tags:
 *
 * - `srcset`/`sizes`, so a phone downloads the 640px variant instead of the
 *   1400px original (the variants come from `generate-image-variants.ts`);
 * - `loading="lazy"`, because a body always sits below the cover image — a long
 *   post otherwise pulls a dozen full-size photos during initial load;
 * - intrinsic `width`/`height`, so the browser reserves each box and the text
 *   stops reflowing as the photos land.
 */

/** Body copy is capped at 72ch, which lands near 672px on desktop. */
const BODY_SIZES = "(max-width: 768px) 100vw, 672px";

function buildSrcSet(src: string, intrinsicWidth: number): string | null {
  const rungs = VARIANT_WIDTHS.filter((w) => w < intrinsicWidth);
  if (rungs.length === 0) return null;
  return [...rungs.map((w) => `${variantPath(src, w)} ${w}w`), `${src} ${intrinsicWidth}w`].join(", ");
}

export function withImageLoadingHints(html: string): string {
  return html.replace(/<img\b([^>]*)>/gi, (tag, attrs: string) => {
    const src = attrs.match(/\ssrc="([^"]*)"/i)?.[1];
    if (!src) return tag;

    const parts: string[] = [];
    const size = getPublicImageSize(src);

    if (size) {
      if (!/\swidth=/i.test(attrs)) parts.push(`width="${size.width}" height="${size.height}"`);

      const srcSet = /\.webp$/i.test(src) ? buildSrcSet(src, size.width) : null;
      if (srcSet && !/\ssrcset=/i.test(attrs)) parts.push(`srcset="${srcSet}" sizes="${BODY_SIZES}"`);
    }

    if (!/\sloading=/i.test(attrs)) parts.push('loading="lazy"');
    if (!/\sdecoding=/i.test(attrs)) parts.push('decoding="async"');

    return parts.length ? `<img${attrs} ${parts.join(" ")}>` : tag;
  });
}
