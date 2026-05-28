---
phase: 4
title: "Cutover domain"
status: pending
priority: P1
effort: "0.5d (planning + monitoring window)"
dependencies: [3]
---

# Phase 4: Cutover domain

## Context Links

- [Brainstorm](../reports/260526-1614-brainstorm-vps-cloudflare-migration.md) §Phase 4
- Cloudflare custom domains: https://developers.cloudflare.com/pages/configuration/custom-domains/

## Overview

Point the production domain (`qstech.vn` + any www / regional variants) from
Vercel to Cloudflare Pages. Keep Vercel deployment live for 7 days as the
verified rollback path. After the monitoring window closes, mark the
`260511-1436-fullstack-cms-bilingual` plan as superseded and schedule
credential revocation for the now-unused services.

## Key Insights

1. **DNS TTL is the safety net.** Lower TTL to 300 ≥ 24h before the swap so
   any reversal propagates in 5 min, not hours.
2. **Cutover is two changes, not one.** (a) Add the apex/www to the Pages
   project (Cloudflare issues a cert), (b) flip DNS records. Doing them
   simultaneously is brittle; do (a) first, verify, then (b).
3. **Rollback ≠ delete the Vercel project.** Keep Vercel deployed and reachable
   via its preview URL for the full 7-day window. Re-pointing DNS back is the
   one-command rollback.
4. **Index recheck after cutover.** Submit the new sitemap to Google Search
   Console; the 301s from Phase 3 transfer rank, but only if the engine sees
   them. Without this, the new SEO surface lags.

## Requirements

### Functional
- `https://qstech.vn` (and any other production hostnames) serve from
  Cloudflare Pages with a valid TLS cert.
- Old un-prefixed VI URLs continue to 301 to `/vi/...` (already configured in
  Phase 3 `_redirects`).
- Vercel deployment remains live on its own URL for 7 days as rollback.

### Non-functional
- Cutover-induced downtime < 5 min (measured from a continuous external probe).
- No TLS cert errors during or after cutover.
- Google Search Console picks up the new sitemap within 48h.

## Architecture

```
T-24h:    Lower TTL of qstech.vn A/CNAME records to 300s.
T-0:      Add qstech.vn to Cloudflare Pages → cert provisioning (~5 min).
T+5min:   Update DNS records:
            apex: CNAME flattening or A → Cloudflare Pages IPs (per dashboard)
            www:  CNAME → <project>.pages.dev
          Lowered TTL means change propagates in ≤ 5 min.
T+30min:  External probe sees Cloudflare cert chain + 200 on /, /products/...
T+24h:    Search Console: submit https://qstech.vn/sitemap.xml.
T+7d:     Monitoring window closes → schedule Vercel project + Neon DB +
          Upstash + Vercel Blob + Resend credential revocation.
```

## Related Code Files

### Modify
- Cloudflare Pages env var `NEXT_PUBLIC_APP_URL` → `https://qstech.vn` (or
  whichever apex is canonical); trigger a redeploy so the build bakes the new
  base URL into sitemap/canonical/OG.
- [docs/deployment.md](../../docs/deployment.md) — append cutover playbook +
  rollback steps.
- [docs/development-roadmap.md](../../docs/development-roadmap.md) — close out
  CMS phase, mark static migration complete.
- [docs/project-changelog.md](../../docs/project-changelog.md) — record cutover
  date + scope.
- [docs/system-architecture.md](../../docs/system-architecture.md) — replace
  Vercel/Neon/Better-Auth topology with Cloudflare Pages static.
- [plans/260511-1436-fullstack-cms-bilingual/plan.md](../260511-1436-fullstack-cms-bilingual/plan.md) —
  add a "Superseded by [260528-1030 migration](../260528-1030-static-cloudflare-pages-migration/plan.md)"
  banner at top + flip `status` to `cancelled` (or whatever the CLI supports as
  "superseded").

### Create
- (None — operational phase, mostly external config + docs.)

## Implementation Steps

1. **Pre-flight checklist (24h before cutover).**
   - DNS TTL on production records lowered to 300s.
   - Phase 3 preview URL has run for ≥ 48h with no incidents.
   - External uptime probe (UptimeRobot / Better Uptime) pointed at the preview
     URL to baseline latency.
   - Backup: `git tag pre-cutover-<date>` on `main` after Phase 1-3 merged.

2. **Merge migration branch.**
   - Re-run Phase 2 build locally on `main` after merge to confirm green.
   - Cloudflare Pages auto-deploys from `main`; verify the new preview URL.

3. **Add custom domain to Pages.**
   - Cloudflare dashboard → Pages → project → Custom domains → add `qstech.vn`,
     `www.qstech.vn`, plus any regional variants.
   - Wait for cert provisioning (status flips to "Active").
   - Do NOT update DNS yet — the dashboard will show "Verify DNS" hints.

4. **Flip DNS.**
   - Cloudflare DNS (if domain is on Cloudflare nameservers): change apex from
     Vercel target to the Pages target the dashboard provides; same for www.
   - If DNS is hosted elsewhere: change CNAMEs to `<project>.pages.dev` and apex
     via ALIAS/ANAME, per host's docs.
   - Save and start a stopwatch.

5. **Monitor cutover window (first 30 min).**
   - `watch -n 10 'curl -sI https://qstech.vn | head -3'`
   - Confirm cert is Cloudflare-issued, response 200/302 as expected.
   - Test old URLs: `curl -I https://qstech.vn/products` → 301 → `/vi/products/`.
   - If anything breaks → revert DNS back to Vercel target (one-command rollback).

6. **Post-cutover docs + analytics.**
   - Update `NEXT_PUBLIC_APP_URL` on Pages → trigger redeploy → verify sitemap.xml
     uses the apex URL.
   - Submit `https://qstech.vn/sitemap.xml` to Google Search Console.
   - Add the new property in any analytics tool (or update domain on existing one).

7. **7-day monitoring window.**
   - Daily: check Cloudflare Pages analytics + uptime probe.
   - If issues surface: rollback via DNS flip back to Vercel.
   - At day 7 without incidents → schedule credential revocation:
     - Vercel: delete project (or pause).
     - Neon: drop database, delete project.
     - Upstash: delete Redis instance.
     - Vercel Blob: delete blob store, revoke `BLOB_READ_WRITE_TOKEN`.
     - Resend: revoke API key, remove unused domain.
     - GitHub: remove the Vercel app integration if no other project uses it.

8. **Plan housekeeping.**
   - Mark `260511-1436-fullstack-cms-bilingual` superseded (status flip + top-of-file
     banner pointing here).
   - Run `/ck:plan archive` for both this plan and the superseded one.
   - `/ck:journal` to document decisions and lessons learned.

## Todo List

- [ ] Lower DNS TTL to 300s (≥ 24h before cutover)
- [ ] Confirm Phase 3 preview stable ≥ 48h
- [ ] Set up external uptime probe
- [ ] `git tag pre-cutover-<date>` on `main`
- [ ] Merge migration branch to `main`
- [ ] Add `qstech.vn` + www + variants to Cloudflare Pages custom domains
- [ ] Wait for cert provisioning
- [ ] Flip DNS to Cloudflare Pages targets
- [ ] First-30-min validation (curl, browser, old URL 301s)
- [ ] Update `NEXT_PUBLIC_APP_URL` env + trigger redeploy
- [ ] Submit sitemap to Search Console
- [ ] Update analytics property
- [ ] 7-day daily monitoring
- [ ] Revoke Vercel / Neon / Upstash / Blob / Resend credentials (day 7+)
- [ ] Update `docs/deployment.md`, `development-roadmap.md`, `project-changelog.md`, `system-architecture.md`
- [ ] Mark CMS plan superseded; archive both plans
- [ ] `/ck:journal` entry

## Success Criteria

- [ ] `https://qstech.vn` serves from Cloudflare with valid TLS
- [ ] Cutover downtime measured < 5 min via uptime probe
- [ ] Old un-prefixed URLs 301 to `/vi/...`
- [ ] Sitemap accepted by Search Console within 48h
- [ ] 7 days with no rollback needed
- [ ] Monthly cost on platform dashboards ≤ $1
- [ ] All deprecated service credentials revoked
- [ ] Docs (`deployment.md`, `system-architecture.md`, etc.) reflect new topology
- [ ] CMS plan marked superseded

## Risk Assessment

| Risk | Mitigation |
|---|---|
| DNS propagation slower than TTL suggests in some networks | Accept; uptime probe will report exact moment; user-visible impact small |
| TLS cert provisioning fails (rate-limited / domain validation issue) | Add the domain in step 3 hours before step 4; cert must be "Active" before DNS flip |
| `_redirects` rule misses an old URL pattern still indexed in Google | Pull Search Console "Pages indexed" list before cutover; add missing patterns to `_redirects` |
| Vercel project auto-disabled by inactivity before 7-day window ends | Keep one manual deploy or pin the project as "Active" in Vercel dashboard |
| Credential revocation breaks a different project that shared a key | Audit each key's other consumers before revocation; revoke one at a time |
| Cutover during business hours triggers complaints | Schedule outside peak (e.g. 22:00 ICT); pre-announce to stakeholders |

## Security Considerations

- After 7-day window, every secret in `.env.local` for Neon / Upstash / Vercel
  Blob / Resend / Better Auth must be revoked at source. Local file should be
  pruned and the developer machine cleared.
- The `cms-archive` tag created in Phase 1 may contain seed/test secrets in
  commit history — confirm the tag is private to the GitHub repo, not pushed
  to any public fork.
- Cloudflare dashboard: enable 2FA for every account with Pages access; log
  the access list in `docs/deployment.md`.

## Next Steps

- After Phase 4 stabilizes: consider Phase 5 (Pages Function `/api/lead` +
  CRM forward) once the separate CRM project lands. See brainstorm §Phase 5.
- Consider Phase 6 (Sveltia git-CMS) once a non-dev editor is onboarding. See
  brainstorm §Phase 6.
