import { ImageResponse } from "next/og";
import { getNewsBySlug } from "@/lib/data/news";
import { OgImageTemplate } from "@/lib/seo/og-image-template";
import type { Locale } from "@/lib/i18n/config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const n = await getNewsBySlug(slug, locale);

  return new ImageResponse(
    (
      <OgImageTemplate
        title={n?.title ?? slug}
        subtitle={n?.excerpt?.slice(0, 120)}
        tag={n?.cat ?? "Tin tức"}
        meta={n?.date ?? ""}
      />
    ),
    { width: 1200, height: 630 },
  );
}
