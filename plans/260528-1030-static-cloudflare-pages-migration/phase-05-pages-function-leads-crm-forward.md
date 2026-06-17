---
phase: 5
title: "Contact form Pages Function + CRM forward"
status: pending
priority: P1
effort: "0.5d"
dependencies: [1, 2]
---

# Phase 5: Contact form Pages Function + CRM forward

## Context Links

- Plan: [Static + Cloudflare Pages Migration](./plan.md)
- Current handler being replaced: [app/api/leads/route.ts](../../app/api/leads/route.ts)
- Validation reused: [lib/validation/lead-schema.ts](../../lib/validation/lead-schema.ts)
- Rate-limit reused: [lib/ratelimit.ts](../../lib/ratelimit.ts)
- Form client (unchanged): [app/[locale]/services/_components/inquiry-form.tsx](../../app/[locale]/services/_components/inquiry-form.tsx)

## Overview

`output: "export"` cannot host a Next.js route handler — static export emits no
server runtime. The contact form must keep working, so `/api/leads` moves out of
the Next build into a **Cloudflare Pages Function** at `functions/api/leads.ts`
(Workers runtime). The function validates, rate-limits, **forwards to a CRM
webhook**, and **emails the admin via Resend in parallel**. No database.

The client form is untouched: it still `POST`s to `/api/leads`; on Cloudflare,
the Pages Function claims that path while the rest of the site is static.

## Key Insights

1. **Static + route handler cannot coexist** in one Next export build. Pages
   Functions live in `functions/` (separate from `out/`) and run on Workers —
   this is the only place a request-time handler survives. Phase 1 already
   deletes `app/api/leads/route.ts`; this phase re-creates the behavior in
   `functions/`.
2. **`CRM_WEBHOOK_URL` is intentionally empty for now** (user, 2026-06-17). When
   empty, the function **skips the forward** but still sends the Resend email, so
   no lead is lost before the CRM exists. Filling the env later needs no rebuild.
3. **Resend runs in parallel, not as a fallback.** Both the CRM forward and the
   admin email fire on every valid submission (user confirmed: keep Resend to
   guard against dropped leads). Email failure must not fail the request.
4. **Workers runtime ≠ Node.** `@upstash/ratelimit` + `@upstash/redis` are
   fetch/REST-based → run on Workers. Resend is called via its REST API
   (`fetch https://api.resend.com/emails`) with an inline HTML body — do NOT
   import `lib/email/send.ts` (Node React-render path). Build the email string in
   the function.
5. **Validation reuse.** `leadInput` (Zod) is pure and imports cleanly into the
   function. Keep honeypot + 422 semantics identical to the old handler.
6. **No `/admin/leads`.** Admin/auth/DB are gone (Phase 1). Leads exist only in
   the CRM (once wired) and the admin inbox.

## Requirements

Functional:
- `POST /api/leads` accepts the existing `leadInput` JSON shape.
- Rate-limit 10/min per IP (Upstash); degrade gracefully if Upstash env unset.
- Honeypot filled → return `200 {ok:true}` without forwarding/emailing.
- Valid lead → forward to `CRM_WEBHOOK_URL` (skip if empty) **and** send Resend
  admin email. Return `200 {ok:true}` if at least the email path is attempted.
- Invalid body → `422` with field errors; bad JSON → `400`; over limit → `429`.

Non-functional:
- Runs on Cloudflare Workers runtime (no Node built-ins).
- Email/CRM failures logged, never surfaced as a 500 to the user once validated.
- Secrets only from Pages env vars, never committed.

## Architecture

```
Browser ─POST /api/leads─► functions/api/leads.ts (Workers)
   1. parse JSON                → 400 on failure
   2. checkFormRateLimit(ip)    → 429 if exceeded (skip if Upstash unset)
   3. leadInput.safeParse       → 422 on failure
   4. honeypot set?             → 200 {ok:true}, stop
   5. CRM_WEBHOOK_URL set?      → fetch POST forward (await, non-fatal)
   6. RESEND_API_KEY set?       → fetch POST api.resend.com (parallel, non-fatal)
   7. return 200 {ok:true}
```

## Related Code Files

Create:
- `functions/api/leads.ts` — the Pages Function.

Read / reuse (import or copy minimal logic):
- `lib/validation/lead-schema.ts` — `leadInput` (import).
- `lib/ratelimit.ts` — `checkFormRateLimit` (import; verify Workers-safe).

Delete (in Phase 1, confirm gone here):
- `app/api/leads/route.ts`, `app/api/auth/**`, `app/api/upload/**`,
  `app/api/cron/**`.

Do NOT import:
- `lib/email/send.ts`, `lib/db/*`, anything pulling Node/React-render.

## Implementation Steps

1. Scaffold `functions/api/leads.ts` with `onRequestPost` (Pages Functions
   signature: `({ request, env }) => Response`).
2. Read client IP from `CF-Connecting-IP` header (Cloudflare-provided).
3. Port the parse → rate-limit → validate → honeypot pipeline from the old
   handler, swapping `process.env` → `env` and `NextResponse` → `Response`.
4. CRM forward: if `env.CRM_WEBHOOK_URL`, `await fetch(url, {method:"POST",
   headers:{"content-type":"application/json"}, body: JSON.stringify(lead)})`;
   wrap in try/catch, log on failure, continue.
5. Resend email: if `env.RESEND_API_KEY` + `env.LEAD_NOTIFY_EMAIL`, `fetch
   https://api.resend.com/emails` with inline subject/HTML built from the lead
   fields; try/catch, non-fatal.
6. Return `200 {ok:true}`.
7. Document required Pages env vars (Phase 3 sets them in the dashboard):
   `CRM_WEBHOOK_URL` (empty), `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`,
   `RESEND_API_KEY`, `RESEND_FROM`, `LEAD_NOTIFY_EMAIL`.

## Todo List

- [ ] Create `functions/api/leads.ts` with `onRequestPost`.
- [ ] Verify `lib/ratelimit.ts` + `lib/validation/lead-schema.ts` import clean on Workers.
- [ ] Wire CRM forward (skip-on-empty) + Resend email (parallel, non-fatal).
- [ ] Local test with `wrangler pages dev out` (or Phase 3 preview).
- [ ] Confirm old `app/api/**` route handlers are deleted (Phase 1).

## Success Criteria

- [ ] Submitting the contact form on a `*.pages.dev` preview returns `200`.
- [ ] With `CRM_WEBHOOK_URL` empty: no forward attempted, Resend admin email
      received.
- [ ] With `CRM_WEBHOOK_URL` set to a test endpoint (e.g. webhook.site): payload
      arrives there AND admin email received.
- [ ] Honeypot-filled submission returns `200` with no forward/email.
- [ ] 11th request within a minute from one IP returns `429`.
- [ ] `next build` (static export) is unaffected — function lives outside `out/`.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `lib/ratelimit.ts` pulls a Node-only path on Workers | Low | Med | It's `@upstash/*` REST only — verify at build; inline a minimal limiter if it breaks. |
| Resend React-template path accidentally imported → Workers bundle fails | Med | Med | Build email HTML inline in the function; never import `lib/email/send.ts`. |
| Lead lost while CRM_WEBHOOK_URL empty | Low | High | Resend email runs regardless of CRM env — admin always notified. |
| Spam once endpoint is public | Med | Low | Honeypot + Upstash 10/min/IP retained from current handler. |

## Security Considerations

- Honeypot + rate-limit retained (anti-spam).
- No secrets in repo; all via Pages env vars.
- Validate + cap all fields (Zod `leadInput` already bounds lengths).
- CORS: same-origin form POST; no need to open CORS.

## Next Steps

- Phase 3 (deploy preview) sets the env vars and verifies the form end-to-end on
  `*.pages.dev` before cutover.
- When the CRM/ERP project lands, fill `CRM_WEBHOOK_URL` — no rebuild needed.
