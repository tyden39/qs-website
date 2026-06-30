---
phase: 6
title: "Verify"
status: done (local gates; live CRM/CORS deploy smoke pending real origin)
priority: P1
dependencies: [1, 2, 3, 4, 5]
---

# Phase 6: Verify

## Overview
Validate the whole batch: static build, types, i18n parity, and a Cloudflare Pages smoke test of the Function + forms.

## Requirements
- Functional: build produces `out/`; contact + inquiry forms POST to the CRM and create leads; search/filters/links work end-to-end.
- Non-functional: no type/lint regressions; i18n keys in parity.

## Implementation Steps
1. `tsx scripts/check-i18n-keys.ts` → key parity passes.
2. `yarn build` (static export) → clean; `out/` + `public/search-index.*.json` present.
3. Forms: from a build served on an allowlisted origin, submit contact + inquiry → assert CRM `201` (lead in CRM admin) + 400/429 handling. Verify no CSP/CORS errors in console for the cross-origin POST.
4. Manual: `/search?q=F86` real results + tabs/filters/pagination; products chips+sort; news tabs+pagination.
5. `grep -rn 'href="#"' app components` → only the deferred downloads "Tải ↓" links remain.
6. CSP check: CRM origin in `connect-src`, share/embed origins allowed in `public/_headers`; no console CSP violations.
7. Optional: code-review on the diff (CRM client + search index are the high-risk surfaces).

## Success Criteria
- [ ] Build + typecheck + i18n check all green.
- [ ] Contact + inquiry forms create leads in CRM (`201`); 400/429 handled.
- [ ] Search, product filters, news filters verified manually.
- [ ] Only deferred-downloads `href="#"` remain.

## Risk Assessment
- CORS/CSP differs between localhost and the deployed origin. Mitigation: verify from the real allowlisted domain, not just localhost.
