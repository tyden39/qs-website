---
phase: 10
title: "QA & Production Deploy"
status: pending
priority: P1
effort: "5d"
dependencies: [3, 4, 5, 6, 7, 8, 9]
execution: sequential
---

# Phase 10: QA & Production Deploy (Sequential Convergence)

## Overview

Final convergence sau khi 7 parallel streams (Phase 3–9) hoàn thành. Hardening trước go-live: integration testing, Lighthouse audit, a11y review, full smoke test, security review, Vercel production deploy với env config, post-deploy verification, docs + journal.

**Execution model:** Sequential — depends on all 7 parallel streams. Cannot start until all merge.

## Requirements

**Functional:**
- All parallel streams integrated, conflicts resolved
- Lighthouse pass ≥ 90 cả 4 axes (Performance, Accessibility, Best Practices, SEO) trên 5 representative pages
- Accessibility: keyboard nav, focus visible, ARIA labels, contrast WCAG AA
- Full smoke test suite (20+ items)
- Production deploy Vercel với prod env vars
- Custom domain configured (qstech.vn hoặc subdomain)
- DNS + SSL working
- Vercel Analytics + Speed Insights enabled
- Sitemap submitted Google Search Console + Bing Webmaster
- i18n CI lint pass

**Non-functional:**
- Zero TypeScript errors, zero lint warnings
- Bundle size analyzed
- `docs/*.md` updated
- Rollback plan documented

## Architecture

```
Production environment
├── Vercel project: qs-website (linked)
├── Domain: qstech.vn (apex + www)
├── DNS: A + AAAA + CNAME records
├── SSL: auto by Vercel
├── Env vars: production scope
│   ├── DATABASE_URL          (Neon prod)
│   ├── BETTER_AUTH_SECRET    (rotated prod)
│   ├── BETTER_AUTH_URL       (https://qstech.vn)
│   ├── BLOB_READ_WRITE_TOKEN
│   ├── RESEND_API_KEY
│   ├── UPSTASH_REDIS_REST_URL / TOKEN
│   ├── LEAD_NOTIFY_EMAIL
│   ├── CRON_SECRET
│   └── NEXT_PUBLIC_APP_URL
└── Vercel features
    ├── Fluid Compute (default Node 24)
    ├── Analytics + Speed Insights
    ├── BotID enabled
    └── Cron: /api/cron/prune-audit (weekly)
```

**Integration checklist (parallel stream merge):**
- [ ] Phase 3 (Products) merged
- [ ] Phase 4 (News + Tiptap) merged
- [ ] Phase 5 (Apps + Services) merged
- [ ] Phase 6 (Datasheets + Leads + Forms) merged
- [ ] Phase 7 (SEO) merged
- [ ] Phase 8 (i18n EN + Locale Switcher) merged
- [ ] Phase 9 (Admin Polish) merged
- [ ] No merge conflicts on shared files (sidebar, messages/vi.json, public page metadata)
- [ ] Schema unchanged from Phase 2 lock

**Smoke test checklist (20 items):**
1. Home VI render, EN switch work
2. All product detail × 6 render VI + EN
3. All news detail × 7 render
4. All application detail × 7 render
5. Service detail render
6. Datasheets table filter work, download PDF
7. Search page work
8. Contact form submit → email + lead in admin
9. Services inquiry form submit
10. Newsletter form submit
11. Datasheet request form submit
12. Admin login → dashboard
13. Admin create/edit/delete product
14. Admin create news với Tiptap + images
15. Admin invite editor → email → activate
16. Locale switcher preserve path + scroll
17. 404 page render
18. Sitemap.xml load
19. Robots.txt load
20. OG image render trên Facebook/Twitter debugger

## Related Code Files

**Create:**
- `vercel.ts` (replace `vercel.json` if any)
- `docs/deployment.md` — production runbook
- `docs/incident-runbook.md` — common issues + fixes
- `scripts/smoke-test.sh` (curl-based)

**Modify:**
- `docs/system-architecture.md` — reflect production state
- `docs/codebase-summary.md` — final state
- `docs/project-roadmap.md` — mark phases 1–10 ✅
- `docs/project-changelog.md` — v1.0.0 entry
- `docs/project-overview-pdr.md` — update status
- `README.md` — production URL + status badge

## Implementation Steps

1. **Merge parallel streams**
   - Merge Phase 3, 4, 5, 6, 7, 8, 9 branches into integration branch (or main if trunk-based)
   - Resolve any conflicts on shared files
   - Full test build: `yarn build`

2. **Pre-deploy code quality**
   ```bash
   yarn build
   yarn tsc --noEmit
   yarn lint
   yarn i18n:check
   npx drizzle-kit check
   ```
   Fix any warnings/errors.

3. **Bundle analysis**
   ```bash
   ANALYZE=1 yarn build
   ```
   Inspect bundle, ensure Tiptap lazy-loaded, remove unused deps.

4. **Lighthouse local audit**
   - 5 representative pages: `/`, `/products`, `/products/f86`, `/news`, `/news/astro-12x`
   - Each: VI + EN
   - Target ≥ 90 all 4 axes
   - Fix common: meta description, image sizes, contrast

5. **Accessibility audit**
   - Manual keyboard navigation through Header + SearchPanel + main forms
   - Screen reader test (NVDA/VoiceOver) cho home + product detail
   - axe DevTools scan
   - Fix: ARIA labels, focus visible, semantic HTML, contrast

6. **Security review**
   - `/admin/*` middleware gate work (curl as anonymous)
   - Rate limit test (spam 15 req → 429)
   - BotID test
   - Secrets audit: grep `console.log` for env leaks
   - HttpOnly + SameSite + Secure cookies
   - CSP headers basic
   - Cron endpoint `CRON_SECRET` check

7. **Vercel project setup production**
   - Vercel dashboard: connect GitHub repo
   - Production branch: `main`
   - Env vars production: import từ Neon/Resend/Upstash/Blob production resources
   - Build settings: `yarn build`, output `.next`
   - Framework preset: Next.js (auto)

8. **vercel.ts**
   ```ts
   import { type VercelConfig } from '@vercel/config/v1';
   export const config: VercelConfig = {
     framework: 'nextjs',
     buildCommand: 'yarn build',
     crons: [{ path: '/api/cron/prune-audit', schedule: '0 2 * * 0' }],
   };
   ```

9. **Custom domain + DNS**
   - Add `qstech.vn` + `www.qstech.vn` in Vercel project
   - Configure DNS per Vercel guide (A for apex, CNAME for www)
   - Wait propagation, verify SSL active
   - Redirect www → apex (or reverse — QS decides)
   - SPF/DKIM/DMARC for email (Resend guide)

10. **First production deploy** — **Updated Session 2 (Failure F10)**
    - **Pre-deploy gate (NEW):** Create a Neon staging branch from prod DB. Run `tsx scripts/create-admin.ts` against staging with the EXACT prod env vars to confirm Better Auth accepts the password. This catches password-policy mismatches BEFORE prod migration commits.
    - Push to preview deployment first (NOT main)
    - Run migration on prod DB: `DATABASE_URL=<prod> npx drizzle-kit migrate`
    - Run seed prod (1 lần): `DATABASE_URL=<prod> tsx scripts/seed.ts`
    - Create first admin: `ADMIN_EMAIL=admin@qstech.vn ADMIN_PASSWORD=... DATABASE_URL=<prod> tsx scripts/create-admin.ts`
    - Verify admin login on PREVIEW URL (not yet at qstech.vn)
    - ONLY AFTER admin login confirmed → flip DNS to point qstech.vn at the production deployment
    - **Rollback runbook update:** `pg_dump` snapshot BEFORE migration; tested restore procedure documented in `docs/deployment.md`

11. **Post-deploy smoke test**
    - Run 20-item smoke checklist
    - Verify Vercel Analytics tracking
    - Verify Speed Insights ingesting
    - Test email delivery from prod (Mail Tester 10/10)
    - Test rate limit prod

12. **SEO submission**
    - Google Search Console: add property, verify, submit sitemap
    - Bing Webmaster Tools: same flow

13. **Docs sweep**
    - Update `system-architecture.md` với production state
    - Update `codebase-summary.md` reflect new structure
    - Mark roadmap phases done
    - Add changelog `v1.0.0 — 2026-MM-DD`
    - Write `deployment.md` runbook
    - Write `incident-runbook.md` (DB down, email fail, etc.)

14. **Rollback plan**
    - Vercel: Rolling Releases hoặc instant rollback to previous deployment
    - DB: pg_dump backup before migration
    - Document rollback steps trong `deployment.md`

15. **Journal**
    - Run `/ck:journal` để document decisions, gotchas, surprises từ parallel execution

## Success Criteria

- [ ] All 7 parallel streams merged, conflicts resolved
- [ ] `yarn build` zero warnings, `tsc` zero errors, lint clean, `i18n:check` pass
- [ ] Lighthouse ≥ 90 cả 4 axes × 5 pages × 2 locales
- [ ] Accessibility audit pass (axe + manual keyboard)
- [ ] Security checklist pass (auth gate, rate limit, secrets, cookies, cron secret)
- [ ] Production deploy success on qstech.vn (or agreed domain)
- [ ] SSL active, custom domain work
- [ ] Production DB migrated + seeded
- [ ] First admin user created prod
- [ ] All 20 smoke test items pass
- [ ] Email delivery prod work (DKIM/SPF/DMARC)
- [ ] Vercel Analytics + Speed Insights active
- [ ] Sitemap submitted Google + Bing
- [ ] BotID + Rate limit active prod
- [ ] Audit prune cron registered + tested manual
- [ ] Docs updated, changelog v1.0.0
- [ ] Rollback plan documented
- [ ] Journal entry written

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Parallel streams merge conflict trên shared files | Phase 2 frozen schema + sidebar; Phase 7 append-only metadata. Conflict resolution time-boxed 1d |
| DNS propagation chậm > 24h | Test với /etc/hosts override; rollback Vercel preview URL |
| Production env vars miss | Pre-deploy checklist diff dev vs prod |
| First migration prod fail | Backup DB, dry-run với `drizzle-kit check`, rollback script |
| Email DKIM/SPF fail | DNS records first, Mail Tester (10/10) |
| Vercel Fluid Compute cold start | Pre-warm với uptimerobot ping |
| Lighthouse Performance < 90 với admin bundle | Admin pages không tính cho public; lazy load Tiptap |
| Search Console verification fail | Multiple methods (DNS TXT, HTML file, meta tag) |
| Hidden bug chỉ xuất hiện prod | Rolling Releases gradual 10% → 50% → 100% |
| Cost spike (Resend/Blob/Neon) | Billing alerts on each provider |
| Customer data accidentally exposed | Final review: no anonymous API endpoint returns users/leads; admin gate verified |
| Stream missing key in messages/en.json | CI lint `i18n:check` catches → block deploy |

## Post-Launch (Phase 11+ scope, document only)

- Playwright E2E tests
- Sentry error reporting
- Customer portal UI build (auth schema sẵn)
- Master Data Service Go build + sync bridge
- Performance budget enforcement CI
- A/B testing landing variants
- Newsletter campaigns via Resend
- Real product photography replace SVG placeholders
- Settings page full implementation (brand config, etc.)
- DOMPurify nếu mở customer-write content
