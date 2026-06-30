# Cloudflare static-export — broken assets tracking

Date: 2026-06-30 · Branch: main · Context: static export (`output: export`) deployed on Cloudflare Pages.

Running list of issues found while reviewing the live deploy. Update status as each is verified post-deploy.

## Issues

| # | Symptom | Root cause | Status |
|---|---------|-----------|--------|
| 1 | Home Showreel video thumbnails missing | CSP `img-src 'self' blob: data:` did not allow `https://i.ytimg.com` (YouTube poster). Same-origin only. | ✅ Fixed `84351b5` — added `i.ytimg.com` to `img-src`. |
| 2 | Showreel video won't play (iframe blocked) | No `frame-src` in CSP → fell back to `default-src 'self'` → blocked `https://www.youtube-nocookie.com` embed. | ✅ Fixed `84351b5` — added `frame-src https://www.youtube-nocookie.com`. |
| 3 | Product listing page images missing | **`_redirects` namespace collision.** Rule `/products/* /vi/products/:splat 301` intercepted asset requests `/products/f54-front.webp` → 301 to non-existent `/vi/products/f54-front.webp` → 404. Cloudflare-only (`_redirects` doesn't run on local/`serve out`); only `/products/` hit it (home `/home/*` has no redirect). Splat can't exclude by extension. | ✅ Fixed `96b4b45` — moved `public/products/` → `public/img/products/` (no route prefix matches), updated 6 refs in `data/products.ts`. |
| 4 | `/og-default.png` missing asset | Referenced by OG metadata in `app/[locale]/products/page.tsx:39` and `app/[locale]/products/[slug]/page.tsx:30` but file absent in `public/`. Not visible on-page, breaks social-share preview. | 🔲 TODO — add `public/og-default.png` (1200×630). |
| 5 | "Can't navigate on Cloudflare" | NOT reproduced. No external `<script>` in build → CSP doesn't block hydration; nav HTML hrefs correct (`/vi/products/` etc., dirs exist). Likely the blocked media made the page look dead. | ⏳ Verify after redeploy. If real: capture exact symptom (404 vs no-response vs hard-refresh fail). |

## Fix verification (local)

- `out/_headers` CSP after fix:
  `img-src 'self' blob: data: https://i.ytimg.com; ... frame-src https://www.youtube-nocookie.com; frame-ancestors 'none'`
- All code image refs vs `public/` cross-checked: only `/og-default.png` missing (#4).
- Build green (`yarn build`, 10s).

## Open questions

- Live domain unreachable from this sandbox (no network) → live-site probes (HTTP status, content-type, stale check) must be run by user.
- Confirm Cloudflare build picks up the latest commit (was the deploy stale when #3 was observed?).
