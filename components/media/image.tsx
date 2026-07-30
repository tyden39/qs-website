import NextImage, { type ImageProps } from "next/image";
import { hasUsableVariants } from "@/lib/media/image-optimizable";

/**
 * Drop-in replacement for `next/image` that opts an image out of the custom
 * loader when the build produced no smaller copy of it, and that gives every
 * `priority` image the matching element-level fetch priority.
 *
 * Import this instead of `next/image` everywhere. Props and behaviour are
 * identical; the differences are:
 *
 * - Assets the variant ladder cannot help (logos, swatches, PNGs, remote
 *   posters) render as a plain `<img>` with a single src rather than a srcset
 *   whose entries all resolve to the same file. An explicit `unoptimized` prop
 *   still wins.
 * - `priority` only emits the `<link rel="preload">` — the tag itself ships
 *   with neither `loading="eager"` nor `fetchpriority="high"`, so the request
 *   still queues behind the rest of the document once the preload is consumed.
 *   Marking the tag as well is what actually moves an LCP hero to the front of
 *   the queue, so `priority` implies `fetchPriority="high"` here. Passing
 *   `fetchPriority` explicitly still wins (the hero slider uses that to hand
 *   the boost to whichever slide is first).
 */
export default function Image({ unoptimized, ...props }: ImageProps) {
  const { src, width, sizes, priority, fetchPriority } = props;

  const resolved =
    unoptimized ??
    (typeof src === "string"
      ? !hasUsableVariants(src, typeof width === "number" ? width : undefined, sizes !== undefined)
      : false);

  return (
    <NextImage
      {...props}
      unoptimized={resolved}
      fetchPriority={fetchPriority ?? (priority ? "high" : undefined)}
    />
  );
}
