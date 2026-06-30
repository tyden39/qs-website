---
phase: 1
title: "Wire forms to CRM public lead endpoint"
status: done
priority: P1
dependencies: []
---

# Phase 1: Wire forms to CRM public lead endpoint

## Overview
The 4 forms POST to a non-existent `/api/leads`. Instead of building a backend, post directly to the existing **CRM public endpoint** `POST {API_BASE}/public/leads` (unauthenticated, rate-limited 5/min/IP). No Cloudflare Pages Function, no Upstash needed. Rebuild the contact form to match the CRM contract per `~/ws/qs/qs-crm/docs/lead-form-page-guide.md`.

## CRM API contract (source of truth — `lead-form-page-guide.md` §2)
`POST {API_BASE}/public/leads`, `Content-Type: application/json`:
| Field | Type | Required |
|---|---|---|
| `name` | string | ✅ trimmed non-empty |
| `phone` | string | ✅ trimmed non-empty |
| `email` | string | optional (validate client-side) |
| `business_field` | string | optional (group code or free text) |
| `notes` | string | optional |
| `services` | string[] | optional, must be known codes |

Service codes (exact): `control_unit` (Bộ điều khiển), `machine_manufacturing` (Chế tạo máy), `machine_upgrade` (Nâng cấp máy).
Business-group codes: `builder`, `end_user`, `commercial`, `manufacturing`, `machine_manufacturing` (else free text).
Responses: `201` created · `400 {error,code}` validation · `429` rate limit. **Backend stores codes only — labels are our i18n.**

## Architecture / decisions
- **API base** (confirmed): `https://crm.qstcnc.com/api/v1` → endpoint `https://crm.qstcnc.com/api/v1/public/leads` (cross-origin). Default via env `NEXT_PUBLIC_CRM_API_BASE=https://crm.qstcnc.com/api/v1`. CORS being provisioned CRM-side — treat the deployed origin as allowlisted.
- **CSP**: add the CRM origin to `connect-src` in `public/_headers` so the cross-origin `fetch` is not blocked.
- **Rate limit / honeypot**: CRM already rate-limits per IP; drop the unused `/api/leads`, `lib/ratelimit.ts`, `@upstash/*` plan (keep honeypot client-side as cheap bot filter — sent fields the CRM ignores are harmless, but prefer not sending unknown fields).
- **Field mapping** per form:
  - **Contact form** → full rebuild: `name`, `phone` (now required), `email`, `business_field` (Select with "Other" → free text), `notes` (= message), `services[]` checkboxes. Mirror CRM `LeadForm` behavior in this site's own markup/styling (do NOT import shadcn/React from CRM — guide §4).
  - **Service inquiry form** (`services/_components/inquiry-form.tsx`) → map its service context to `services:[<code>]`, collect `name`+`phone`(required)+`email`+`notes`.
  - **Newsletter** (email only) and **Datasheet request** (email + slug): **OUT OF SCOPE** (confirmed). Do not wire to CRM; leave existing UI/components untouched. Their POST to `/api/leads` stays dead but is not addressed by this plan.

## Related Code Files
- Modify: `app/[locale]/contact/_components/contact-form.tsx` (rebuild fields + schema + CRM POST + 201/400/429 handling)
- Modify: `app/[locale]/services/_components/inquiry-form.tsx` (CRM POST + services code + required phone)
- Create: `lib/crm/leads-client.ts` (typed `createPublicLead(payload)`, base-url + response-code handling — single source for both forms)
- Modify: `lib/validation/lead-schema.ts` or new `lib/validation/crm-lead-schema.ts` (match CRM contract: phone required, services enum)
- Modify: `public/_headers` (CSP `connect-src` += CRM origin)
- Modify: `messages/*/contact.json`, `messages/*/service.json` (service/business labels ↔ codes, i18n)
- Config: document `NEXT_PUBLIC_CRM_API_BASE` in `docs/` deployment notes.
- Remove from scope (not built): `functions/api/leads.ts`, Upstash wiring. Consider deleting unused `lib/ratelimit.ts` + `@upstash/*` deps if nothing else uses them (verify first).

## Implementation Steps
1. Confirm CRM API base + that the deployed Pages origin is in `CORS_ALLOWED_ORIGINS`. Add `NEXT_PUBLIC_CRM_API_BASE`.
2. Build `lib/crm/leads-client.ts`: `createPublicLead()` → `POST {base}/public/leads`; return discriminated result for 201/400/429/network.
3. Rebuild contact form: add `phone` (required), `business_field` Select (+Other free text), `services[]` checkboxes (3 codes), keep honeypot; map to CRM payload (omit empty optionals); wire success(201)/error(400 message)/429(retry) states. Keep current visual design + i18n.
4. Update inquiry form to use the same client with `services:[code]` derived from the service page context; add required `phone`.
5. Add CRM origin to CSP `connect-src` in `public/_headers`.
6. Leave newsletter + datasheet forms untouched (out of scope).
7. Manual test against CRM (`https://crm.qstcnc.com/api/v1/public/leads`): success, validation error surfacing, rate-limit.

## Success Criteria
- [ ] Contact form submits a valid lead → CRM returns `201`; lead visible in CRM admin.
- [ ] Service codes sent exactly (`control_unit`/`machine_manufacturing`/`machine_upgrade`); unknown codes never sent.
- [ ] `phone` required + validated; empty optionals omitted.
- [ ] `400` shows the CRM error message; `429` asks user to retry; network error handled.
- [ ] No CSP violation on the cross-origin POST; CORS ok from the deployed origin.
- [ ] No reference to the dead `/api/leads` remains in contact/inquiry forms.

## Risk Assessment
- **CORS/origin mismatch** between Pages deploy domain and CRM allowlist. Mitigation: verify `CORS_ALLOWED_ORIGINS` includes the exact deployed origin; test from the real domain, not just localhost.
- **CSP blocks the POST**. Mitigation: add CRM origin to `connect-src`; check browser console.
- **Contract drift** (service/business codes). Mitigation: codes hardcoded from guide §2; labels via i18n; add a comment pointing at the guide as source of truth (no plan IDs in code).
- **Newsletter/datasheet** intentionally out of scope; they remain non-functional by decision (not a regression introduced here).
