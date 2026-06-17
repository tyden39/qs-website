---
phase: 4
title: "Switch production config to Cloudflare Pages"
status: pending
priority: P1
effort: "0.5d"
dependencies: [3]
---

# Phase 4: Switch production config to Cloudflare Pages

## Context Links

- [Brainstorm](../reports/260526-1614-brainstorm-vps-cloudflare-migration.md) §Phase 4
- Cloudflare custom domains: https://developers.cloudflare.com/pages/configuration/custom-domains/

## Overview

Point the production domain (`qstech.vn` + www / regional variants) at the
Cloudflare Pages project and bake the canonical base URL into the build. This is
a **config switch, not a high-risk cutover**: Vercel only ever hosted the dev
build, never production, so there is no live traffic to drain and no rollback
window to babysit. Add the domain, set the env var, redeploy, verify.

## Requirements

### Functional
- `https://qstech.vn` (and other production hostnames) serve from Cloudflare
  Pages with a valid TLS cert.
- `NEXT_PUBLIC_APP_URL` = the canonical apex; sitemap / canonical / OG bake it in.
- Old un-prefixed VI URLs 301 to `/vi/...` (already configured in Phase 3 `_redirects`).

### Non-functional
- No TLS cert errors after the switch.
- Sitemap reflects the apex URL.

## Implementation Steps

1. **Add custom domain to Pages.**
   - Cloudflare dashboard → Pages → project → Custom domains → add `qstech.vn`,
     `www.qstech.vn`, plus any regional variants.
   - Wait for cert provisioning (status flips to "Active").

2. **Point DNS.**
   - Cloudflare DNS (domain on Cloudflare nameservers): set apex + www to the
     Pages target the dashboard provides.
   - If DNS hosted elsewhere: CNAME to `<project>.pages.dev`, apex via ALIAS/ANAME.

3. **Set canonical base URL + redeploy.**
   - Cloudflare Pages env var `NEXT_PUBLIC_APP_URL` → `https://qstech.vn`.
   - Trigger a redeploy so the build bakes it into sitemap / canonical / OG.

4. **Verify.**
   - `curl -sI https://qstech.vn | head -3` → Cloudflare cert, 200/302.
   - Old URL: `curl -I https://qstech.vn/products` → 301 → `/vi/products/`.
   - `https://qstech.vn/sitemap.xml` uses the apex URL.

5. **Docs + housekeeping.**
   - Update [docs/deployment.md](../../docs/deployment.md),
     [docs/development-roadmap.md](../../docs/development-roadmap.md),
     [docs/project-changelog.md](../../docs/project-changelog.md),
     [docs/system-architecture.md](../../docs/system-architecture.md) — replace
     Vercel/Neon/Better-Auth topology with Cloudflare Pages static.
   - Mark [260511-1436-fullstack-cms-bilingual](../260511-1436-fullstack-cms-bilingual/plan.md)
     superseded (status flip + top-of-file banner pointing here).
   - `/ck:plan archive` both plans; `/ck:journal` to capture decisions.

## Todo List

- [ ] Add `qstech.vn` + www + variants to Cloudflare Pages custom domains
- [ ] Wait for cert provisioning ("Active")
- [ ] Point DNS to Cloudflare Pages targets
- [ ] Set `NEXT_PUBLIC_APP_URL` env + trigger redeploy
- [ ] Verify cert, 200, old-URL 301s, sitemap apex URL
- [ ] Update `docs/deployment.md`, `development-roadmap.md`, `project-changelog.md`, `system-architecture.md`
- [ ] Mark CMS plan superseded; archive both plans
- [ ] `/ck:journal` entry

## Success Criteria

- [ ] `https://qstech.vn` serves from Cloudflare with valid TLS
- [ ] Old un-prefixed URLs 301 to `/vi/...`
- [ ] Sitemap uses the apex URL
- [ ] Monthly cost on platform dashboards ≤ $1
- [ ] Docs reflect new topology
- [ ] CMS plan marked superseded

## Risk Assessment

| Risk | Mitigation |
|---|---|
| TLS cert provisioning fails (rate-limited / domain validation) | Add domain in step 1 and wait for "Active" before pointing DNS in step 2 |
| `_redirects` rule misses an old URL pattern still indexed | Pull Search Console "Pages indexed" list; add missing patterns to `_redirects` |

## Next Steps

- Phase 5 (Pages Function `/api/lead` + CRM forward) runs before this in numbering
  but is the live lead path. See brainstorm §Phase 5.
- Phase 6 (Sveltia git-CMS) once a non-dev editor onboards. See brainstorm §Phase 6.
