import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { getApplicationBySlug, getApplicationSlugs } from "@/lib/data/applications";
import { OgImageTemplate } from "@/lib/seo/og-image-template";
import type { Locale } from "@/lib/i18n/config";
import { routing } from "@/lib/i18n/routing";

export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  const slugs = getApplicationSlugs();
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const a = await getApplicationBySlug(slug, locale);
  const seo = await getTranslations({ locale, namespace: "seo" });

  return new ImageResponse(
    (
      <OgImageTemplate
        title={a?.title ?? slug}
        subtitle={a?.summary?.slice(0, 120)}
        tag={seo("applicationsTitle")}
        meta="qstech.vn/applications"
      />
    ),
    { width: 1200, height: 630 },
  );
}
