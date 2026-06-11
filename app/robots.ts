import type { MetadataRoute } from "next";

// Required for `output: "export"`: emit a static robots.txt at build time.
export const dynamic = "force-static";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://qstech.vn";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/account/", "/login"],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
