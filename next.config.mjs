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
  // A static export has no request-time image optimizer, so responsive variants
  // are pre-rendered by `scripts/generate-image-variants.ts` and the custom
  // loader maps each srcset width onto one of them (falling back to the
  // untouched original, and passing remote posters through unchanged).
  // Both size lists mirror the generated ladder (VARIANT_WIDTHS in
  // lib/media/image-variants.ts) so srcset carries no dead rungs: a width with
  // no file behind it resolves to the next rung up and prints the same variant
  // twice as two candidates.
  // remotePatterns whitelists YouTube poster thumbnails used by the Showreel.
  images: {
    loader: "custom",
    loaderFile: "./lib/media/image-loader.ts",
    deviceSizes: [640, 768, 960, 1400],
    imageSizes: [256, 384],
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }],
  },
};

export default withNextIntl(nextConfig);
