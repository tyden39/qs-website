import { ImageResponse } from "next/og";
import { getProductBySlug, getProductSlugs } from "@/lib/data/products";
import { OgImageTemplate } from "@/lib/seo/og-image-template";
import type { Locale } from "@/lib/i18n/config";
import { routing } from "@/lib/i18n/routing";

export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  const slugs = getProductSlugs();
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const p = await getProductBySlug(slug, locale);

  return new ImageResponse(
    (
      <OgImageTemplate
        title={p?.name ?? slug}
        subtitle={p?.desc?.slice(0, 120)}
        tag={p ? `Controller · ${p.axes} · ${p.display}` : "CNC Controller"}
        meta="qstech.vn/products"
      />
    ),
    { width: 1200, height: 630 },
  );
}
