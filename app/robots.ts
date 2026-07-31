import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/seo/app-url";

export const dynamic = "force-static";

/**
 * Why this file is more than "allow everything":
 *
 * `public/downloads/` is ~229 MB of manuals and CAD archives (45 PDFs, 23 zip/rar,
 * ~3 MB each) and every one of them is a plain `<a href>` on /downloads/, so a
 * crawler that follows links pulls the whole 229 MB in one pass. That is the bulk
 * of the site's Firebase Hosting egress — the HTML is only ~30 KB per page brotli'd.
 *
 * Googlebot and Bingbot are NOT the problem and are deliberately left with full
 * access to those files: Firebase serves `ETag`/`Last-Modified` and answers a
 * conditional request with `304` and zero bytes, so re-crawling unchanged PDFs
 * costs nothing. Blocking them would forfeit PDF indexing (long-tail queries like
 * "f86 operation manual tiếng việt pdf") to save no bandwidth at all.
 *
 * AI *search* crawlers — OAI-SearchBot, ChatGPT-User, PerplexityBot,
 * Claude-User/Claude-SearchBot and friends — are also deliberately NOT blocked.
 * They fall through to the `*` group, which leaves every HTML page open and only
 * withholds the heavy documents. Those bots produce citations and referral
 * traffic; blocking them costs real visitors. Only bulk *training* crawlers and
 * pure SEO scrapers, which return nothing, get `Disallow: /`.
 *
 * Ordering matters in a way that is easy to get wrong: a crawler obeys ONLY the
 * single most specific group that matches its user-agent — it does not merge
 * groups. That is why the Googlebot/Bingbot group repeats the private-path
 * disallows instead of relying on the `*` group to supply them.
 *
 * `robots.txt` is advisory. Bytespider in particular is widely reported to ignore
 * it. Blocking a bot that lies about its user-agent needs a proxy in front of
 * Firebase Hosting (Cloudflare), not this file.
 */

/** Never useful to any crawler; these paths do not exist on this static export. */
const PRIVATE_PATHS = ["/admin/", "/api/", "/account/", "/login"];

/**
 * The heavy documents, matched by extension rather than by the whole `/downloads/`
 * directory: that directory also holds `hero.webp` and its width variants, which
 * are render assets for the downloads page and must stay crawlable.
 */
const HEAVY_DOWNLOADS = [
  "/downloads/*.pdf$",
  "/downloads/*.zip$",
  "/downloads/*.rar$",
];

/**
 * Bulk training corpora and data resellers. Blocking these gives up inclusion in
 * future model weights, which drives no traffic, and reclaims the bandwidth.
 * `Google-Extended` and `Applebot-Extended` are opt-out tokens rather than real
 * crawlers — they save no bandwidth, but they are the documented way to decline
 * Gemini/Apple Intelligence training without touching search ranking.
 */
const AI_TRAINING_BOTS = [
  "GPTBot",
  "ClaudeBot",
  "anthropic-ai",
  "CCBot",
  "Bytespider",
  "meta-externalagent",
  "Amazonbot",
  "Applebot-Extended",
  "Google-Extended",
  "PetalBot",
  "Diffbot",
  "ImagesiftBot",
  "Omgilibot",
  "YouBot",
  "cohere-ai",
];

/** Backlink/rank scrapers. They index the site to resell the data; zero SEO value. */
const SEO_SCRAPERS = [
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DotBot",
  "DataForSeoBot",
  "BLEXBot",
  "rogerbot",
  "Barkrowler",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: ["Googlebot", "Bingbot"],
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: [...PRIVATE_PATHS, ...HEAVY_DOWNLOADS],
      },
      {
        userAgent: [...AI_TRAINING_BOTS, ...SEO_SCRAPERS],
        disallow: "/",
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
