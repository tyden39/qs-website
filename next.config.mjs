import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

// Static export for Cloudflare Pages: no server runtime. Security headers (CSP,
// nosniff, referrer-policy) are served by Cloudflare via a `_headers` file —
// Next's `async headers()` is not applied to a static export.
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
};

export default withNextIntl(nextConfig);
