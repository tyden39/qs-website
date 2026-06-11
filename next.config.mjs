import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

// Static export for Cloudflare Pages. No server runtime: CSP and other security
// headers move to a Cloudflare `_headers` file (Phase 3). Images are served
// unoptimized because the Next image optimizer needs a server.
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
};

export default withNextIntl(nextConfig);
