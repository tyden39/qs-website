---
phase: 3
title: "Deploy Cloudflare Pages preview"
status: pending
priority: P1
effort: "0.5d"
dependencies: [2]
---

# Phase 3: Deploy Cloudflare Pages preview

## Context Links

- [Brainstorm](../reports/260526-1614-brainstorm-vps-cloudflare-migration.md) §Phase 3
- Cloudflare Pages docs: https://developers.cloudflare.com/pages/

## Overview

Connect the GitHub repo to a new Cloudflare Pages project, get the first
preview deployment green at `*.pages.dev`, and finalize the platform-level
config (`_redirects`, `_headers`) that replaces the dynamic features we just
removed.

## Key Insights

1. **`_redirects` is now the SEO contract.** Every URL that used to work
   un-prefixed (`/products`, `/news/<slug>`, …) must 301 to the new `/vi/...`
   form. Skipping this hands Google ranks back.
2. **`_headers` replaces `next.config.mjs` headers().** Static export can't emit
   custom headers — Cloudflare Pages reads `out/_headers` at deploy time.
3. **Build env: lock the Node version.** Pages defaults can lag — pin via
   `NODE_VERSION` env var + a `.nvmrc` file. Pinned to **Node 22** matching
   local v22.21.1 (validation session 1).
4. **No domain cutover yet.** Stay on `*.pages.dev` for the entire phase. DNS
   work is Phase 4.

## Requirements

### Functional
- Cloudflare Pages project linked to `tyden39/qs-website` GitHub repo.
- Build command produces `out/` and Pages publishes it.
- Every public route reachable at `https://<project>.pages.dev/vi/...` and `/en/...`.
- Old un-prefixed URLs return 301 → new prefixed equivalents.
- Root `/` → `/vi/` 302.
- Security headers (CSP, X-Content-Type-Options, Referrer-Policy, X-Frame-Options) applied.
- Static assets (`/_next/static/*`) cached with `Cache-Control: public, max-age=31536000, immutable`.

### Non-functional
- Build time on Pages < 3 min wall clock.
- TTFB on `*.pages.dev` < 100 ms from VN / SG / US.
- Lighthouse score within 5 points of the current Vercel production.

## Architecture

```
GitHub: tyden39/qs-website (main)
   │   push
   ▼
Cloudflare Pages
   build: yarn build       (NODE_VERSION=20, YARN_VERSION pinned)
   output: out/
   ├── _redirects          ← committed to repo root → public/_redirects, copied into out/
   ├── _headers            ← same pattern
   ├── _next/static/...
   ├── vi/.../index.html
   └── en/.../index.html
```

Either commit `_redirects` and `_headers` to `public/` (Next copies `public/`
to `out/` during export) — that's the clean path. Verify they land at
`out/_redirects` and `out/_headers` after build.

## Related Code Files

### Create
- [.nvmrc](../../.nvmrc) — single line: `22` <!-- Updated: Validation Session 1 - Node 22 matches local -->

- [public/_redirects](../../public/_redirects) — see content below.
- [public/_headers](../../public/_headers) — see content below.
- [docs/deployment.md](../../docs/deployment.md) (or update existing) —
  document the Pages project name, build settings, env vars, manual deploy
  steps, rollback steps. So future operators don't guess.

### Reference content

`public/_redirects`:
```
# Root → default locale
/                          /vi/                       302

# Old un-prefixed VI routes → /vi/* (preserve SEO)
/products                  /vi/products/              301
/products/*                /vi/products/:splat        301
/services                  /vi/services/              301
/services/*                /vi/services/:splat        301
/news                      /vi/news/                  301
/news/*                    /vi/news/:splat            301
/applications              /vi/applications/          301
/applications/*            /vi/applications/:splat    301
/downloads                 /vi/downloads/             301
/downloads/*               /vi/downloads/:splat       301
/about                     /vi/about/                 301
/contact                   /vi/contact/               301
/search                    /vi/search/                301
```

`public/_headers`:
```
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Content-Security-Policy: default-src 'self'; img-src 'self' blob: data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'

/_next/static/*
  Cache-Control: public, max-age=31536000, immutable

/_next/image/*
  Cache-Control: public, max-age=31536000, immutable
```

(CSP no longer needs `unsafe-eval` if Next dev mode features are gone in the
built output — verify; tighten further if possible.)

## Implementation Steps

1. **Cloudflare Pages project setup.**
   - Cloudflare dashboard → Pages → Create → connect GitHub → select repo.
   - Production branch: `main`.
   - Build command: `yarn install --frozen-lockfile && yarn build`
   - Build output directory: `out`
   - Environment variables (Production + Preview):
     - `NODE_VERSION` = `22`
     - `YARN_VERSION` = `1.22.21` (matches local yarn classic)
     - `NEXT_PUBLIC_APP_URL` = `https://<project>.pages.dev` (Phase 4 changes
       this to the real domain).
   - Save; trigger first build from the migration branch by pushing it.

2. **Commit `.nvmrc`, `public/_redirects`, `public/_headers`.**
   - Verify locally that `yarn build` copies them to `out/_redirects` and
     `out/_headers` (Next copies `public/` 1:1).

3. **Push branch, watch first build.**
   - Cloudflare dashboard → Pages → Deployments → tail logs.
   - Fix anything env-mismatched (Node version, yarn lockfile drift).
   - Build green → preview URL appears.

4. **Edge validation pass.**
   - `curl -I https://<preview>.pages.dev/` → `302 → /vi/`
   - `curl -I https://<preview>.pages.dev/products` → `301 → /vi/products/`
   - `curl -I https://<preview>.pages.dev/products/<known-slug>` → `301 → /vi/products/<slug>/`
   - `curl -I https://<preview>.pages.dev/vi/products/` → `200` + correct headers
   - `curl -I https://<preview>.pages.dev/vi/products/<known-slug>/` → `200`
   - Spot-check EN: `/en/products/` → `200`.
   - Check `Cache-Control` on a static asset: must be `immutable`.

5. **Functional smoke.**
   - Open preview URL in a browser, click through every nav item in both VI and EN.
   - Verify `next/image` works (unoptimized images render).
   - Verify OG images: `curl -I https://<preview>.pages.dev/vi/products/<slug>/opengraph-image` → `200 image/png`.
   - Sitemap: `https://<preview>.pages.dev/sitemap.xml` lists prefixed URLs.
   - Robots: `https://<preview>.pages.dev/robots.txt` correct.

6. **Lighthouse + perf check.**
   - Run Lighthouse against preview URL (mobile + desktop, both locales).
   - Score delta vs Vercel production must be within 5 points for Performance,
     Accessibility, Best Practices, SEO.
   - TTFB: measure from VN if possible (curl from a VN-tunneled box, or rely on
     Cloudflare Speed test in dashboard).

7. **Document.**
   - Update or create `docs/deployment.md` with: Pages project name, build
     settings, env vars, redeploy steps, rollback steps, who has dashboard access.

## Todo List

- [ ] Create Cloudflare Pages project + connect repo
- [ ] Configure build command, output dir, env vars
- [ ] Commit `.nvmrc`, `public/_redirects`, `public/_headers`
- [ ] Trigger preview build; resolve env issues
- [ ] Curl-validate `/` redirect, old un-prefixed redirects, `/vi/*` and `/en/*` 200s
- [ ] Smoke test all routes in browser (VI + EN)
- [ ] Validate OG image PNGs
- [ ] Validate sitemap.xml + robots.txt
- [ ] Run Lighthouse, compare against Vercel production
- [ ] Verify security headers via `curl -I`
- [ ] Write `docs/deployment.md`

## Success Criteria

- [ ] Cloudflare Pages green deployment from `feat/static-cloudflare-migration`
- [ ] `_redirects` correctly 301s every documented old URL
- [ ] `_headers` correctly applies CSP + cache headers to all routes
- [ ] Lighthouse Performance ≥ 90 mobile (or within 5 of current prod)
- [ ] No 4xx/5xx on any nav-reachable route in browser smoke
- [ ] `docs/deployment.md` covers redeploy + rollback playbook

## Risk Assessment

| Risk | Mitigation |
|---|---|
| `public/_redirects` and `_headers` not copied to `out/` due to Next quirk | Confirm post-build: `ls out/_redirects out/_headers`; if missing, copy in a `postbuild` script |
| CSP too tight breaks a third-party widget (Cloudflare Turnstile, analytics) | Don't add third-party widgets in this phase; if any exist, allowlist explicitly |
| Pages default Node differs from local | Pin `NODE_VERSION=22` env + `.nvmrc` (local is v22.21.1) |
| Pages build cache stale (deps changed dramatically) | First build: clear cache from dashboard; subsequent builds rebuild deps automatically |
| Lighthouse score drops > 5 pts | Investigate before cutover; usually image optimization or font loading — fix in this phase, not after cutover |

## Security Considerations

- Cloudflare dashboard access: 2FA mandatory; document who has access.
- GitHub repo → Pages connection uses a Cloudflare-issued token; do not commit
  it. Revocable from Cloudflare dashboard.
- `_headers` CSP is the new enforcement point — review carefully.

## Next Steps

→ Phase 4: DNS cutover from Vercel to Cloudflare Pages.
