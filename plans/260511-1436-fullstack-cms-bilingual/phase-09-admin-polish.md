---
phase: 9
title: "Admin Polish (audit/users/invite)"
status: completed
priority: P2
effort: "5d"
dependencies: [2]
execution: parallel
stream: G
---

# Phase 9: Admin Polish — Audit Viewer + User Management + Invite Flow (Parallel Stream G)

## Overview

Build admin-only meta features: audit log viewer, user management, invite flow (admin invites editor), settings placeholder, audit retention cron. Phase 2 created STUB pages for `/admin/audit`, `/admin/users`, `/admin/settings`; Phase 9 fleshes out.

**Parallel execution:** Chạy đồng thời với Phase 3–8.

## File Ownership

- `app/admin/audit/*` (page + components)
- `app/admin/users/*` (page + invite form + components)
- `app/admin/settings/*` (page placeholder)
- `app/[locale]/accept-invite/*` (Updated Session 2 F14 — moved OUT of `(auth)` route group; group parens strip from URL = email links 404)
- `app/admin/_actions/users.ts`
- `app/admin/_actions/audit-queries.ts` (extends audit helper; logger is shared Phase 2)
- `app/api/cron/prune-audit/route.ts`
- `lib/email/templates/admin-invite.tsx` (Phase 9 adds; Phase 6 owns `lib/email/*` infra; coordinate)

**Reads from:**
- `lib/db/schema/auth.ts` (users, invites — FROZEN by Phase 2)
- `lib/db/schema/runtime.ts` (audit_log — FROZEN)
- `lib/email/{client,send}.ts` (Phase 6 provides; Phase 9 adds template only)

**Writes to:**
- `messages/vi.json` → `admin.users.*`, `admin.audit.*`, `admin.settings.*`, `auth.invite.*` sub-namespaces

**Coordination with Phase 6 — Updated Session 2 (F12):** `lib/email/{client,send}.ts` is NOW created in Phase 2 (shared infrastructure). Phase 9 only adds `lib/email/templates/admin-invite.tsx`. Phase 6 only adds its own templates (lead-notification, newsletter-confirm). No stub-swap risk.

**Coordination with Phase 2:** Phase 2 created `invites` table in schema. Phase 2 also created STUB pages at `/admin/audit`, `/admin/users`, `/admin/settings` — Phase 9 overwrites them.

## Requirements

**Functional:**
- `/admin/audit`: list audit_log with filter (actor, entity, action, date range), pagination, diff render collapsible
- `/admin/users`: list users (admin role only) with filter by role, status, lastLogin
- `/admin/users/invite`: form (email, name, role) → Server Action create invite + send email
- `/auth/accept-invite?token=...`: set password page → activate
- `/admin/settings`: placeholder (brand color, site title, default OG, contact email — defer most to Phase 11+)
- Audit retention cron: weekly delete audit_log > 180 days
- Audit log captures user mutations (role change, invite, deactivate)

**Non-functional:**
- Audit list paginated (50/page)
- Diff JSON pretty-print with syntax highlight
- Invite token TTL 24h
- Email template branded

## Architecture

```
app/admin/audit/
├── page.tsx                  list + filter + pagination
└── _components/
    ├── audit-columns.tsx
    └── diff-viewer.tsx       collapsible JSON pretty print

app/admin/users/
├── page.tsx                  list users
├── invite/page.tsx           invite form
└── _components/
    ├── user-columns.tsx
    └── invite-form.tsx

app/admin/settings/
└── page.tsx                  placeholder

app/[locale]/accept-invite/         # Updated Session 2 F14 — NOT inside (auth) route group
├── page.tsx                  validate token, show set-password form (GET does NOT mark used)
└── set-password-form.tsx     POST atomic claim

app/admin/_actions/
├── users.ts                  inviteUser, changeRole, deactivateUser
└── audit-queries.ts          query helpers (logger is Phase 2 shared)

app/api/cron/prune-audit/
└── route.ts                  weekly cron

lib/email/templates/
└── admin-invite.tsx          React Email template
```

**Invite flow — Updated Session 2 (F14, full hardening):**
1. Admin fills form: email, name, role (editor/admin)
2. `inviteUser()` Server Action (wrapped with `defineAdminAction` per F5):
   - Generate **256-bit token**: `crypto.randomBytes(32).toString('base64url')` (NOT randomUUID)
   - Insert into `invites` (id, email, token, role, expiresAt = now() + 24h, used=false, createdBy)
3. Send Resend email via `lib/email/send.ts` (Phase 2). **Email link path is `/<locale>/accept-invite?token=...&email=<email>` — NOT `/auth/...`** (the `(auth)` parens are a Next.js route group that's stripped from URL). Email AND token both required as query params.
4. **Route lives at `app/[locale]/accept-invite/page.tsx` — NOT inside `(auth)` group** (route group strips from URL = broken link). If admin layout grouping is desired, use a non-URL-stripping wrapper.
5. Invited user clicks → validate: token matches, email matches, not used, not expired. **Show set-password form only — GET does NOT mark invite used** (defends against Outlook ATP / Slack URL preview scanners that fetch links).
6. Submit password (POST with CSRF token) → atomic claim:
   ```ts
   const [claimed] = await db.update(invites)
     .set({ used: true })
     .where(and(eq(invites.token, token), eq(invites.email, email), eq(invites.used, false), gt(invites.expiresAt, new Date())))
     .returning();
   if (!claimed) throw new Error('Invite invalid or already claimed');
   ```
7. Better Auth `signUp.email()` with role; audit log; redirect `/admin/dashboard`
8. **URL generation centralized:** `lib/auth/invite-url.ts` exports `buildInviteUrl(email, token, locale)` — email template and route both import from here. No drift.

**Audit retention cron (in `vercel.ts` already set Phase 10):**
```ts
crons: [{ path: '/api/cron/prune-audit', schedule: '0 2 * * 0' }]  // weekly Sun 02:00
```
Endpoint: `DELETE FROM audit_log WHERE created_at < NOW() - INTERVAL '180 days'`. Auth: Vercel Cron secret header check.

## Related Code Files

**Create:**
- `app/admin/audit/page.tsx` (overwrites Phase 2 STUB)
- `app/admin/audit/_components/audit-columns.tsx`
- `app/admin/audit/_components/diff-viewer.tsx`
- `app/admin/users/page.tsx`
- `app/admin/users/invite/page.tsx`
- `app/admin/users/_components/user-columns.tsx`
- `app/admin/users/_components/invite-form.tsx`
- `app/admin/settings/page.tsx`
- `app/[locale]/accept-invite/page.tsx` (Updated Session 2 F14 — not inside `(auth)` route group)
- `app/[locale]/accept-invite/set-password-form.tsx`
- `lib/auth/invite-url.ts` (NEW F14 — centralizes URL generation so email + route never drift)
- `app/admin/_actions/users.ts`
- `app/admin/_actions/audit-queries.ts`
- `app/api/cron/prune-audit/route.ts`
- `lib/email/templates/admin-invite.tsx`

**Modify:**
- `messages/vi.json` → `admin.users.*`, `admin.audit.*`, `admin.settings.*`, `auth.invite.*`

## Implementation Steps

1. **Audit viewer**
   - Server component: `db.select().from(auditLog).orderBy(desc(createdAt)).limit(50).offset(page*50)`
   - Join với users để show actor email
   - Filter: actor (select), entity (select), action (select), date range (DatePicker)
   - Columns: createdAt / actor / action / entity / entityId / diff (truncated, click expand)
   - DiffViewer: collapsible JSON pretty-print using `react-json-view-lite` or similar

2. **User management**
   - `/admin/users` list: email, name, role, status (active/deactivated), lastLogin, createdAt
   - Filter by role
   - Actions: change role (Server Action, admin only), deactivate
   - Better Auth `setRole()` API or direct DB update + session invalidation

3. **Invite form**
   - shadcn Form: email (required, valid), name, role (Select editor|admin)
   - Server Action `inviteUser()`:
     ```ts
     const token = crypto.randomUUID();
     const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
     await db.insert(invites).values({ email, token, role, expiresAt, used: false, createdBy: session.user.id });
     await sendInviteEmail({ to: email, name, token, role });
     await logAudit({ action: 'invite', entity: 'user', entityId: email, diff: { role } });
     ```

4. **Accept invite page**
   - `app/[locale]/accept-invite/page.tsx` (NOT in `(auth)` group per F14): read `?token=` and `?email=` query
   - Validate: invite exists, not used, not expired
   - Show set-password form
   - Submit → Better Auth `signUp.email()` with role override → mark invite used → audit log → redirect `/admin/dashboard`

5. **Email template** (`lib/email/templates/admin-invite.tsx`)
   - React Email với brand header
   - CTA button "Activate account" → invite link with token
   - Expiration notice
   - Sender: noreply@qstech.vn (per Phase 10 DNS setup)

6. **Audit retention cron**
   - `app/api/cron/prune-audit/route.ts`: check `request.headers.get('authorization') === \`Bearer ${process.env.CRON_SECRET}\``
   - SQL: `DELETE FROM audit_log WHERE created_at < NOW() - INTERVAL '180 days'`
   - Log count deleted
   - Coordinate with Phase 10 to register cron in `vercel.ts`

7. **Settings placeholder**
   - `/admin/settings`: render "Coming soon" or minimal config (defer most to Phase 11+)
   - Optional MVP: brand contact email (env), default OG image upload

8. **i18n keys** — add `admin.users.*`, `admin.audit.*`, `admin.settings.*`, `auth.invite.*`

9. **Smoke test**
   - Invite editor email → email received → click link → set password → login OK
   - Invite expired token → error message
   - Invite already used → error message
   - Audit viewer: filter by actor → results correct
   - Diff viewer: expand JSON readable
   - Cron manually trigger → audit prune runs
   - Change user role → audit log entry

## Success Criteria

- [ ] `/admin/audit` viewer with filter + pagination + diff render
- [ ] `/admin/users` list + role change + deactivate
- [ ] Invite flow end-to-end (form → email → set password → login)
- [ ] Token TTL 24h enforced
- [ ] Settings placeholder renders
- [ ] Audit retention cron registered (in vercel.ts via Phase 10)
- [ ] Audit log entries cho user mutations
- [ ] Email template renders brand correctly
- [ ] `tsc --noEmit` pass

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Better Auth invite plugin chưa tồn tại | Custom flow as designed (~1 day). Verify in research before start |
| Invite token leak | Token cryptographically random (UUID v4), single-use, TTL 24h |
| Invite spam (sai email) | Audit log + admin can deactivate. Rate limit invites/day per admin |
| Audit log table grows fast | Retention cron 180d. Phase 11+ archive to S3 if compliance need |
| Cron auth bypass | `CRON_SECRET` env var, header check |
| Audit diff jsonb size lớn | Phase 5 risk: truncate >50KB diffs. Diff viewer handles gracefully |
| Email template depends on Phase 6 infra | Phase 9 can stub email client if Phase 6 not done yet; swap at integration |
| Conflict with Phase 2 STUB pages | Phase 9 overwrites STUB content — clean boundary |
| User deactivate breaks active session | Better Auth session invalidation + force logout next request |

## Parallel Coordination Notes

- **Depends on Phase 2** for invites/audit_log schemas + STUB pages.
- **Coordinates with Phase 6** for email infra (Phase 6 provides `lib/email/{client,send}.ts`).
- **Coordinates with Phase 10** for cron registration in `vercel.ts`.
- **Phase 8 i18n** translates `admin.users.*`, `admin.audit.*`, `admin.settings.*`, `auth.invite.*` keys.
