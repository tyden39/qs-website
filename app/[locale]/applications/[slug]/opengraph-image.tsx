import { ImageResponse } from "next/og";
import { getApplicationBySlug } from "@/lib/data/applications";
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
  const a = await getApplicationBySlug(slug, locale);

  return new ImageResponse(
    (
      <OgImageTemplate
        title={a?.title ?? slug}
        subtitle={a?.summary?.slice(0, 120)}
        tag="Ứng dụng công nghiệp"
        meta="qstech.vn/applications"
      />
    ),
    { width: 1200, height: 630 },
  );
}
