import NextImage, { type ImageProps } from "next/image";
import { hasUsableVariants } from "@/lib/media/image-optimizable";

/**
 * Drop-in replacement for `next/image` that opts an image out of the custom
 * loader when the build produced no smaller copy of it.
 *
 * Import this instead of `next/image` everywhere. Props and behaviour are
 * identical; the only difference is that assets the variant ladder cannot help
 * (logos, swatches, PNGs, remote posters) render as a plain `<img>` with a
 * single src rather than a srcset whose entries all resolve to the same file.
 * An explicit `unoptimized` prop still wins.
 */
export default function Image({ unoptimized, ...props }: ImageProps) {
  const { src, width, sizes } = props;

  const resolved =
    unoptimized ??
    (typeof src === "string"
      ? !hasUsableVariants(src, typeof width === "number" ? width : undefined, sizes !== undefined)
      : false);

  return <NextImage {...props} unoptimized={resolved} />;
}
