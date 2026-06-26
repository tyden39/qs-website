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
  // unoptimized: required for static export. remotePatterns whitelists YouTube
  // poster thumbnails (i.ytimg.com) used by the Showreel video facade.
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }],
  },
};

export default withNextIntl(nextConfig);
