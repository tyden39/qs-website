---
phase: 6
title: "Datasheets + Leads + Public Forms"
status: pending
priority: P1
effort: "5d"
dependencies: [2]
execution: parallel
stream: D
---

# Phase 6: Datasheets + Leads + Public Forms (Parallel Stream D)

## Overview

Hoàn thiện 2 module: Datasheets (PDF upload, link tới product) + Leads (inbox cho form submissions). Wire 4 public form (contact / services inquiry / newsletter / datasheet request) gửi data về DB + email Resend. Bổ sung rate limit Upstash + Vercel BotID.

**Parallel execution:** Chạy đồng thời với Phase 3, 4, 5, 7, 8, 9.

**Red Team Session 2 updates:**
- F5: `defineAdminAction` HOF for all admin actions; public `submitLead` uses separate `definePublicAction` (no role required, only BotID + rate limit).
- F8: Datasheet PDF upload uses Vercel Blob client-direct-upload (PDFs can exceed 4.5MB).
- F11: i18n keys in `messages/vi/{contact,downloads,admin-leads,admin-datasheets}.json`.
- F12: `lib/email/{client,send}.ts` ALREADY created in Phase 2. Phase 6 only adds `lib/email/templates/{lead-notification,newsletter-confirm}.tsx`.

## File Ownership

- `app/admin/datasheets/*`
- `app/admin/leads/*`
- `app/admin/_actions/datasheets.ts`
- `app/admin/_actions/leads.ts`
- `lib/validation/datasheet-schema.ts`
- `lib/validation/lead-schema.ts`
- `lib/email/*` (client, send, templates lead-notification + newsletter-confirm)
- `lib/ratelimit.ts`
- `app/[locale]/contact/_components/*`
- `app/[locale]/services/_components/inquiry-form.tsx` (only `_components/` subdir; main `page.tsx` of services is read-only)
- `app/[locale]/downloads/_components/*`
- `app/[locale]/downloads/datasheets/page.tsx` (replace static UI with DB-backed table filter)
- `components/newsletter-form.tsx`
- `app/api/leads/route.ts` (if needed; Server Actions preferred)

**Reads from:**
- `lib/db/schema/*` (leads, datasheets tables — FROZEN)
- Shared helpers

**Writes to:**
- `messages/vi.json` → `contact.*` namespace (form labels, success/error messages); add `admin.leads.*` and `admin.datasheets.*` sub-namespaces inside the `admin.*` namespace; downloads.*

**Coordinates with Phase 5:**
- `app/[locale]/services/page.tsx` already exists (Phase 2 refactored to DB). Phase 6 only adds inquiry form via `services/_components/inquiry-form.tsx` import. **If Phase 5 needs to edit `services/page.tsx` for layout changes**, they coordinate via PR comment — but Phase 5 ownership scope is admin only, so no conflict expected.

## Requirements

**Functional:**
- Datasheets CRUD: upload PDF Vercel Blob, link `productId` (FK products), category, lang ('vi'|'en'|'both'), size_bytes
- Public `/downloads/datasheets` filterable table with data from DB (replace hardcoded UI)
- Public datasheet download direct (no gate, per user decision)
- Leads admin inbox `/admin/leads`: list, filter by source/status, assign editor, mark resolved
- 4 public form wire: contact, services inquiry, newsletter signup (footer), datasheet request
- Submit → insert lead → send email notification (Resend) → return success
- Rate limit Upstash: 10 req/IP/min cho mỗi form endpoint
- Vercel BotID protection cho form public

**Non-functional:**
- Form UX: optimistic submit, error toast, success inline
- Email template React Email, brand colors
- Audit log mọi lead status change

## Architecture

```
app/admin/datasheets/
├── page.tsx
├── new/page.tsx
├── [id]/edit/page.tsx
└── _components/
    ├── datasheet-form.tsx       PDF uploader + metadata
    └── datasheet-columns.tsx

app/admin/leads/
├── page.tsx                     inbox + filter
├── [id]/page.tsx                detail + history
└── _components/
    └── lead-status-form.tsx

app/[locale]/contact/_components/
└── contact-form.tsx              client component

app/[locale]/services/_components/
└── inquiry-form.tsx

app/[locale]/downloads/_components/
└── datasheet-request-form.tsx

components/newsletter-form.tsx    in Footer

lib/email/
├── client.ts                     Resend client
├── send.ts                       typed wrapper
└── templates/
    ├── lead-notification.tsx     React Email
    └── newsletter-confirm.tsx

lib/ratelimit.ts                  Upstash @upstash/ratelimit

app/admin/_actions/
├── datasheets.ts
└── leads.ts
```

**Rate limit pattern:**
```ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const formRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  prefix: 'form',
});

// In Server Action:
const ip = (await headers()).get('x-forwarded-for') ?? 'unknown';
const { success } = await formRatelimit.limit(ip);
if (!success) throw new Error('Rate limit exceeded');
```

**BotID:**
```ts
import { checkBotId } from '@vercel/botid';
const verification = await checkBotId();
if (verification.isBot) return Response.json({ error: 'bot' }, { status: 403 });
```

**Submit lead Server Action:**
```ts
'use server';
export async function submitLead(input: LeadInput) {
  const bot = await checkBotId();
  if (bot.isBot) throw new Error('bot');
  const ip = (await headers()).get('x-forwarded-for') ?? 'unknown';
  const { success } = await formRatelimit.limit(ip);
  if (!success) throw new Error('rate-limited');
  const parsed = leadSchema.parse(input);
  const [row] = await db.insert(leads).values({ ...parsed, ip }).returning();
  await sendLeadEmail(row);  // try/catch internally
  return { ok: true };
}
```

## Related Code Files

**Create:** (see Architecture)

**Modify:**
- `app/[locale]/contact/page.tsx` — mount ContactForm
- `app/[locale]/downloads/datasheets/page.tsx` — replace static với DB-backed filterable table
- `components/Footer.tsx` — mount NewsletterForm
- `.env.example` — add `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `LEAD_NOTIFY_EMAIL`

**Dependencies:**
```bash
# Note: @vercel/botid was rebranded to `botid` on npm. react-email 6.x is breaking vs 3.x.
yarn add resend@^6.12.3 \
         @upstash/ratelimit@^2.0.8 @upstash/redis@^1.38.0 \
         botid@^1.5.11 \
         react-email@^6.1.5 @react-email/components@^1.0.12
```
> Imports: `import { ... } from 'botid'` (NOT `@vercel/botid`). React Email `render()` is async — `const html = await render(<Template />)`.

## Implementation Steps

1. **Provision services**
   - Vercel Marketplace → Upstash Redis → provision
   - Resend signup → API key → add to env
   - `vercel env pull`

2. **Datasheets CRUD** — **Updated Session 2 (F8)**
   - Form: PDF file input (drag/drop), product picker (Select with search), category dropdown, lang radio
   - **PDF upload: Vercel Blob client-direct-upload** via `@vercel/blob/client` upload() with `contentType: 'application/pdf'`. PDFs commonly >4.5MB; client-direct bypasses function body limit. Phase 2 `/api/upload` issues signed token only.
   - List + filter UI in admin
   - Public `/downloads/datasheets`: fetch DB with filter UI (category, product, lang). Replace hardcoded UI.

3. **Email templates** (React Email)
   - `lead-notification.tsx`: brand header, lead details, CTA button "Mở admin"
   - `newsletter-confirm.tsx`
   - Test với `npx react-email dev`

4. **Rate limit + BotID setup**
   - `lib/ratelimit.ts` — instance per endpoint type (form, login attempt)
   - BotID register trong `instrumentation.ts`

5. **4 public forms (client components)**
   - All react-hook-form + zod
   - Submit handler with toast feedback
   - Honeypot hidden field

6. **submitLead Server Action** — pattern frozen above

7. **Leads inbox** (`/admin/leads`)
   - TanStack Table: status / source / name / email / company / createdAt
   - Filter: status, source, date range
   - Detail `/admin/leads/[id]`: lead body + audit history + assign dropdown + status change form
   - Status change → Server Action update + audit log

8. **i18n keys**
   - `contact.*`, `downloads.*` (public)
   - `admin.leads.*`, `admin.datasheets.*` (sub-namespaces — DO NOT conflict với other streams)

9. **Smoke test**
   - Submit contact form → check leads table + email received
   - Spam loop 15 requests → rate limit kicks in (429)
   - BotID test with curl direct
   - Datasheet PDF upload + public download
   - Admin: change lead status → audit log entry

## Success Criteria

- [ ] Datasheets CRUD + PDF upload work
- [ ] Public datasheets table filter from DB
- [ ] 4 public forms submit successfully
- [ ] Lead insert + email notification via Resend
- [ ] Rate limit Upstash kicks in after 10/min/IP
- [ ] BotID blocks bot traffic (test với curl)
- [ ] Admin leads inbox với filter + status workflow
- [ ] Audit log all lead mutations
- [ ] Email template renders brand
- [ ] `revalidateTag('datasheets')` work
- [ ] `tsc --noEmit` pass

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Resend free tier 3000/month | Marketing B2B low traffic → enough. Upgrade if needed |
| Upstash Redis free tier 10k req/day | Low form traffic → enough |
| Email fall into spam | SPF/DKIM/DMARC setup for qstech.vn (Phase 10) |
| BotID misclassify legitimate user | Captcha fallback defer to Phase 11+ |
| Lead spam dù có rate limit | Honeypot field + admin can mark spam |
| PDF upload fail (large file) | Vercel Blob max 4.5MB free or 500MB pro. Hint user |
| Email send fail blocks form submit | try/catch in sendLeadEmail; lead still inserts |
| Public form wiring conflict with Phase 5 services page | Phase 5 owns admin/services only; public page modification limited to mounting `inquiry-form.tsx`. Coordinate if conflict |
| Datasheets product FK → product deleted? | ON DELETE SET NULL on FK. Admin reassigns or hides datasheets |
| Newsletter form double-opt-in defer | MVP single opt-in OK; legal review for prod |

## Parallel Coordination Notes

- **No dependency on Phase 3, 4, 5 admin CRUD.**
- **Coordinates with Phase 5 only on `app/[locale]/services/page.tsx`** — Phase 6 only adds inquiry form import; Phase 5 doesn't touch public page.
- **Phase 7 SEO** adds metadata to public pages — Phase 6 doesn't touch metadata.
- **Phase 8 i18n** translates `contact.*`, `downloads.*`, `admin.leads.*`, `admin.datasheets.*` keys.
- **Phase 9 Admin Polish** may add lead notification settings — coordinate.
