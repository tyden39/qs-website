# Code Review — Phases 7, 8, 9 (SEO / i18n EN / Admin Polish)

**Date:** 2026-05-19
**Reviewer:** code-reviewer (adversarial pass)
**Scope:** SEO surface, i18n EN, admin audit/users/invite flow
**Build / tsc / i18n:check:** pass (per task report)

---

## Verdict

**REQUEST_CHANGES.**

Phase 9 invite flow has two **CRITICAL** bugs that break the happy path and one **HIGH** that breaks rollback safety. Phase 8 admin locale switcher will crash at runtime, and the public Header carries a regression that breaks navigation under `/en/`. Phase 7 has a runtime-incompatibility CRITICAL in OG image routes and a moderate sitemap shape mismatch with hreflang spec.

The SEO scaffolding is otherwise solid (JSON-LD builders are typed, alternates triple is correct, robots/sitemap are coherent). Phase 9 atomic-claim, hash-only token storage, and "GET does not consume invite" are correctly implemented — kudos.

---

## CRITICAL

### C1 — `acceptInvite` does not actually sign the user in (invite flow broken end-to-end)

**File:** `app/admin/_actions/users.ts:166-178`
**Evidence:**
```ts
const res = await auth.api.signUpEmail({
  body: { email, password, name },
  headers: await headers(),
});
// ... role override, audit log ...
return { ok: true as const };
```
…then client redirects to `/admin/dashboard` (`set-password-form.tsx:44`).

**Why it matters:** Better Auth's `auth.api.signUpEmail()` called from a Server Action does **not** set session cookies unless the `nextCookies` plugin is registered (Better Auth docs: "When you call functions like `signUpEmail` in a server action, cookies won't be set… use the `nextCookies` plugin"). `lib/auth/server.ts:28` registers only `adminPlugin()` — no `nextCookies`. Net effect: account is created, invite is marked used, then the redirect hits `app/admin/layout.tsx:14` which sees no session and bounces the user to `/login`. The user has no idea what password Better Auth stored (they just typed it, but the failure mode looks like the invite did not work). On retry, the invite is already `usedAt != null` so they're locked out permanently and must beg an admin for a new invite.

This is the single most user-visible failure of the whole phase.

**Fix:**
```ts
// lib/auth/server.ts
import { nextCookies } from "better-auth/next-js";
export const auth = betterAuth({
  // ...
  plugins: [adminPlugin(), nextCookies()],
});
```
After adding the plugin, smoke-test the full flow: invite → email link → set password → land on `/admin/dashboard` already authenticated.

---

### C2 — Per-detail OG image routes use Edge runtime but call Node-only DB client

**Files:**
- `app/[locale]/products/[slug]/opengraph-image.tsx:6` (`export const runtime = "edge"`)
- `app/[locale]/news/[slug]/opengraph-image.tsx:6`
- `app/[locale]/applications/[slug]/opengraph-image.tsx:6`

**Evidence:** Each imports `getProductBySlug` / `getNewsBySlug` / `getApplicationBySlug` from `lib/data/*.ts`. Those functions:
1. Use the `"use cache"` directive (`lib/data/products.ts:46,58,70,82` etc.) — Next.js `"use cache"` runs only in Node runtime.
2. Hit `lib/db/client.ts`, which calls `import ws from "ws"` and injects `neonConfig.webSocketConstructor = ws` (Node-only module).

**Why it matters:** Build may pass because Next.js compiles per-route — but the first request to `/products/<slug>/opengraph-image` in deployed/Edge mode will throw `Module not found: ws` or `"use cache" not supported in Edge runtime`. Social-media link unfurls (LinkedIn, Slack, Facebook) will silently 500 → no preview image. The root `/opengraph-image.tsx` is fine because it doesn't query.

**Fix:** Either drop `export const runtime = "edge"` from the three per-detail OG routes (they will run on Node and still cache via Vercel's image CDN), or move the per-slug DB read to `generateStaticParams` and pass via path params only (significantly less flexible). Dropping the directive is the right call.

---

### C3 — Admin `LocaleSwitcher` will throw at runtime; switching also 404s

**Files:**
- `app/admin/layout.tsx` (no `NextIntlClientProvider`)
- `app/admin/_components/admin-shell.tsx:4,25` (mounts `<LocaleSwitcher />`)
- `components/locale-switcher.tsx:3-4,13-15` (`useLocale()`, i18n `useRouter`, `usePathname`)

**Evidence:** The admin routes live at `app/admin/*`, **not** under `app/[locale]/admin/*`. There is no `NextIntlClientProvider` anywhere in the admin tree. `useLocale()` and the i18n `useRouter()` throw "next-intl context not found" if no provider is mounted in their ancestor.

Even if the provider were added, `localePrefix: "as-needed"` (`lib/i18n/routing.ts:7`) plus admin not living under `[locale]` means switching to EN would push the user to `/en/admin/users` — a non-existent route → 404.

**Why it matters:** Any admin user opening any admin page (after Phase 9 merges) gets a React error boundary instead of the UI. This is a P0 regression on the admin shell — blocks all Phase 3-6 admin functionality too.

**Fix options (pick one):**
1. **Remove `LocaleSwitcher` from admin shell** — admin is intentionally Vietnamese-only per Phase 8 plan ("admin UI locale switcher in topbar… persistent localStorage hoặc user preference DB"). The plan even contemplates a *different* admin-local switcher; the public one is wrong here.
2. **Implement admin-only switcher**: client component using localStorage to flip `next-intl`'s locale for an admin-scoped `NextIntlClientProvider` wrapping the shell. Requires moving admin under `[locale]` or mounting a `NextIntlClientProvider` with a static initial messages bundle. Non-trivial — defer per phase plan's own note ("persistent localStorage hoặc user preference DB").

Recommend option 1 for MVP.

---

### C4 — Public `Header` is locale-unaware → breaks every link when user is on `/en/...`

**File:** `components/Header.tsx:2,7-8,42-43,49-50`

**Evidence:** Header imports `Link` from `next/link` (not the i18n-aware `@/lib/i18n/navigation`) and hardcodes paths `/products`, `/applications`, etc. `usePathname` comes from `next/navigation`, which returns the *full* path including `/en` prefix — but since the Link uses raw paths, an EN user clicking "Sản phẩm" navigates to `/products` (VI), not `/en/products`. The whole nav silently drops the locale.

Additionally all menu labels are Vietnamese literals — Phase 8 acceptance criteria says "Public Header có locale switcher (VI/EN, preserve current path + scroll)". Switcher itself preserves path correctly (verified via `useRouter().replace(pathname, { locale })`), but the rest of the nav fights it.

**Why it matters:** Every EN visitor loses locale on first nav click — they bounce back to VI homepage. From an SEO standpoint, Googlebot indexing `/en` will follow these links, see they redirect to VI, and treat the EN tree as broken duplicate content. This undoes most of Phase 7's hreflang work.

**Fix:**
- Replace `import Link from "next/link"` with `import { Link } from "@/lib/i18n/navigation"`.
- Replace `usePathname` from `next/navigation` with the one from `@/lib/i18n/navigation` (so `is()` matches against locale-stripped path).
- Replace hardcoded VI labels with `useTranslations("nav")` and add the corresponding keys to `messages/{vi,en}/nav.json`.

---

## HIGH

### H1 — `acceptInvite` race between Better Auth user insert and Drizzle transaction

**File:** `app/admin/_actions/users.ts:144-193`

**Evidence:** The atomic claim and audit-log writes happen inside `db.transaction((tx) => ...)`. Inside the transaction, `auth.api.signUpEmail()` is called — Better Auth uses its own adapter (`drizzleAdapter(db, ...)`) which goes through the shared connection pool but **does not participate in `tx`**. It writes to `user`/`account`/`session` tables on a separate connection from the pool.

Sequence:
1. `tx` opens, claims invite (`usedAt = now`)
2. Better Auth INSERT on `user` (separate connection — outside tx)
3. `tx` updates user role (inside tx)
4. `tx` writes audit row (inside tx)
5. `tx` commits

If step 3 or 4 throws (e.g., role string violates a check constraint, audit insert fails because the user row is on a different connection and not yet visible to `tx`), the transaction rolls back. The invite is unmarked. **But the Better Auth user row created in step 2 persists.** Now the email has an orphan account with `role = "customer"` (default from `lib/auth/server.ts:22`) and the invite is "fresh" again. Re-using the invite will try to `signUpEmail` again → duplicate email → 500.

There's also a visibility issue: the role UPDATE at line 178 selects `user` by `res.user.id` from inside `tx` — but the user was just inserted on a different connection. Depending on the transaction isolation level (Neon defaults to `READ COMMITTED`) and commit timing of the Better Auth insert, the row may or may not be visible. If not visible, `.where(eq(user.id, res.user.id))` updates zero rows silently — role override is lost; the user ends up as `customer` and can't access admin.

**Why it matters:** Silent-data-corruption class. Won't happen most of the time, but when it does, the support burden is high (the failure looks like "I followed the invite but I'm locked out").

**Fix:** Restructure to avoid the transactional dependency on Better Auth:
1. Phase A (Better Auth, no tx): create the user account.
2. Phase B (`db.transaction`): claim invite, update user role, write audit. If Phase B fails, you can either delete the orphan user or schedule cleanup. Even simpler: do the role override using Better Auth's admin plugin API (`auth.api.setRole`) after both succeed, instead of bypassing it with a raw UPDATE.

At minimum, add a sanity check that the role UPDATE actually affected 1 row:
```ts
const updated = await tx.update(user).set({ role: claimed.role }).where(eq(user.id, res.user.id)).returning({ id: user.id });
if (updated.length !== 1) throw new Error("Role override failed");
```

---

### H2 — `inviteUser` / `changeUserRole` accept arbitrary `role` strings; no allowlist

**Files:**
- `app/admin/_actions/users.ts:23` (`args: { email: string; name: string; role: string }`)
- `app/admin/_actions/users.ts:68` (`changeUserRole` same)

**Evidence:** The handler receives `role: string` from the client. The DB column is `text` (no CHECK constraint) and Better Auth does not validate role values. An admin (or any party with admin session who can construct a Server Action call) can pass `role: "superuser"`, `role: "<script>...</script>"`, or `role: "admin editor"`.

UI funnels editor/admin only (`invite-form.tsx:83-85`, `user-columns.tsx:66-68`), but client-side enums never replace server-side validation for Server Actions.

**Why it matters:** Privilege-confusion: a stored role of `"superuser"` is the wrong shape for `requireRole(["admin"])` and silently denies access — annoyance only. But a value like `"admin "` (trailing space) silently *passes equality check failures in JS* but may match `.includes("admin")` if anyone changes the check, or break audit log filters. The audit `role_change` diff stores the raw string verbatim → injection vector into anything that consumes the audit diff via `dangerouslySetInnerHTML` (currently the diff viewer uses `<pre>{json}</pre>`, so escaped — safe today, but contract is fragile).

**Fix:**
```ts
const ROLES = new Set(["admin", "editor", "customer"]);
if (!ROLES.has(role)) throw new Error("Invalid role");
```
Apply at the top of `inviteUser`, `changeUserRole`, `acceptInvite`. Add the same allowlist in `messages/*/admin-users.json` for label rendering, but the source of truth must be server-side.

---

### H3 — `inviteUser` does not check for an existing user with this email

**File:** `app/admin/_actions/users.ts:21-61`

**Evidence:** No precondition that `user.email != args.email`. Admin can invite an already-active user. The invite row inserts fine (no FK), the email goes out, and when the recipient clicks the link `acceptInvite` calls `signUpEmail` → fails with "User already exists" → invite is consumed (`usedAt` set in the atomic claim before signup attempt). Confusing UX, and the existing user's account is unchanged.

Also no check for *pending unused invite* for the same email — admin can spam invites; each invite is independently valid until expiry, weakening single-use guarantees in practice (last one received wins, but earlier ones still valid for 24h).

**Why it matters:** Operational; not security. But the failure mode (silent invite consumption on a no-op) is the kind of thing that generates a support ticket.

**Fix:** Before inserting the invite:
```ts
const [existing] = await tx.select({ id: user.id }).from(user).where(eq(user.email, email));
if (existing) throw new Error("User with this email already exists");
// Optional: revoke prior unused invites for this email so only one is live
await tx.update(invite).set({ revoked: true }).where(and(eq(invite.email, email), isNull(invite.usedAt), eq(invite.revoked, false)));
```

---

### H4 — Sitemap emits per-locale entries as separate URLs without merging alternates

**File:** `app/sitemap.ts:22-37, 39-67`

**Evidence:** `buildEntry(path)` emits ONE entry with `url = ${APP_URL}${path}` (VI) and `alternates.languages = { vi, en }`. There is no separate entry for the EN URL. The result: sitemap contains only the VI URLs; Google indexes EN URLs only by crawling and is missing per-locale `<xhtml:link>` hints from the EN-side perspective.

Per Google's official sitemap-with-hreflang docs, each language version should appear as its own `<url>` block, each with the same `<xhtml:link>` set pointing to ALL locale variants (including itself). Next.js's `MetadataRoute.Sitemap` supports this when you emit a row per locale.

Also `x-default` is missing from `alternates.languages` in `app/sitemap.ts:30-34`, while it IS present in `lib/seo/alternates.ts:23` (used in HTML head). Discrepancy. Crawlers comparing sitemap hints vs page-level `<link rel="alternate">` may flag inconsistency.

**Why it matters:** Lighthouse SEO ≥ 95 may still pass (it doesn't deep-check sitemap hreflang), but Google Search Console will report hreflang errors. Phase 7 success criterion says "Google Rich Results Test pass" — that passes. But Phase 7 also says "Hreflang alternates correct vi/en/x-default" — sitemap is missing x-default and missing the EN-side entry.

**Fix:**
```ts
function buildEntries(path: string): MetadataRoute.Sitemap {
  const viUrl = `${APP_URL}${path}`;
  const enUrl = `${APP_URL}/en${path}`;
  const alternates = { languages: { vi: viUrl, en: enUrl, "x-default": viUrl } };
  return [
    { url: viUrl, lastModified: new Date(), changeFrequency: "weekly", priority: path === "/" ? 1.0 : 0.8, alternates },
    { url: enUrl, lastModified: new Date(), changeFrequency: "weekly", priority: path === "/" ? 1.0 : 0.8, alternates },
  ];
}
```
And `flatMap` in the assembly step.

---

### H5 — `scripts/translate-data.ts` is broken on first run (table & column names wrong)

**File:** `scripts/translate-data.ts:84-86, 114-115, 145-146, 176-177`

**Evidence:**
- Queries `FROM products`, `FROM news`, `FROM applications`, `FROM services`. Actual table names are singular: `product`, `news` (this one ok), `application`, `service` (see `lib/db/schema/catalog.ts`). Three out of four are wrong.
- Selects `description` from products; schema column is `desc` (`lib/db/schema/catalog.ts`).
- News table has `excerpt` ✓, applications has `summary` ✓, services has `title` ✓.

**Why it matters:** Documented in Phase 8 plan as "Data EN bootstrap: products + applications + services + news titles + excerpts" — a success criterion. Script will throw "relation 'products' does not exist" on the very first SELECT. Not blocking the build (it's a script), but blocks Phase 8 success criteria.

**Fix:** Rename table refs to singular, change `description` → `desc` for products. Run end-to-end once before committing.

---

### H6 — `app/admin/audit/page.tsx:41` boolean expression has operator-precedence bug

**File:** `app/admin/audit/page.tsx:39-46`

**Evidence:**
```ts
Object.entries(merged).forEach(([k, v]) => {
  if (v && v !== "0" || (k === "page" && v !== "0")) {
    if (v) sp.set(k, v);
  }
});
```
`&&` binds tighter than `||`, so this parses as `(v && v !== "0") || (k === "page" && v !== "0")`. For `k === "page"` and `v = undefined`, the right branch is `true && true = true`, enters the block, then `if (v)` skips. Net: harmless today. But also for `v = "0"`: left branch is `("0" && false) = false`, right is `(k==="page" && false) = false` → entry stays out for non-page. The intent seems to be "include if non-empty and non-zero, except for `page` we want to drop only zero". Logic is muddled and the line is brittle. Future maintainer will break it.

**Why it matters:** Pagination query-string assembly is correctness-sensitive. Currently works; bug-shaped.

**Fix:**
```ts
Object.entries(merged).forEach(([k, v]) => {
  if (!v) return;
  if (k === "page" && v === "0") return;
  sp.set(k, v);
});
```

---

## MEDIUM

### M1 — CSP allows `'unsafe-inline'` and `'unsafe-eval'` on `script-src`

**File:** `next.config.mjs:11`

**Evidence:** `script-src 'self' 'unsafe-inline' 'unsafe-eval'`.

Phase 7 adds inline JSON-LD via `<script type="application/ld+json" dangerouslySetInnerHTML={...}>` — this works because of `'unsafe-inline'`. But CSP with `unsafe-inline` provides essentially no XSS protection on scripts. The comment in `next.config.mjs:6-7` even calls this out ("Tiptap-aware nonce middleware will tighten script-src once the rich-text editor ships") — Tiptap shipped in Phase 4 and the nonce middleware has not. JSON-LD scripts are SSR'd statically and can move to nonce-based CSP at low cost.

`'unsafe-eval'` is even worse — needed only if some library uses `eval` / `new Function`. Test by removing it; production grade.

**Why it matters:** Not exploitable today (no known XSS sink), but the CSP header is performative — security review will flag it on day one.

**Fix (deferable):** Implement nonce middleware. JSON-LD scripts include the nonce; CSP becomes `script-src 'self' 'nonce-<random>' 'strict-dynamic'`. Drop `'unsafe-eval'` first and verify build/runtime; that one is usually free to remove.

---

### M2 — `connect-src` CSP missing Neon WebSocket origin

**File:** `next.config.mjs:13`

**Evidence:** `connect-src 'self' https://api.resend.com`. Neon serverless WebSocket connections from client-side (if any) would be blocked. Today everything is server-side, so probably fine — but if any client component ever needs Drizzle via `neon-http`, CSP will block.

**Why it matters:** Latent. Not blocking.

**Fix:** Add `wss://*.neon.tech` and `https://*.neon.tech` to `connect-src` when needed.

---

### M3 — Cron secret uses `===` instead of constant-time compare

**File:** `app/api/cron/prune-audit/route.ts:13`

**Evidence:** `if (authHeader !== \`Bearer ${cronSecret}\`)`.

You asked specifically: yes, in a low-rate weekly cron, the timing-side-channel exploitability is essentially zero. Realistic attacker needs millions of timed requests with low jitter; Vercel function cold-start jitter alone dwarfs the signal. The bigger concern is operational consistency — every other secret comparison in any decent codebase uses `crypto.timingSafeEqual`. Hard to argue against fixing it because the cost is one import.

**Why it matters:** Defense-in-depth / code consistency. Not a real-world vuln.

**Fix (5-min, non-blocking):**
```ts
import { timingSafeEqual } from "crypto";
const expected = Buffer.from(`Bearer ${cronSecret}`);
const got = Buffer.from(authHeader ?? "");
if (got.length !== expected.length || !timingSafeEqual(got, expected)) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

---

### M4 — Invite URL accepts arbitrary `locale` param without validation

**File:** `lib/auth/invite-url.ts:6-14`

**Evidence:** `locale: string = "vi"`. No allowlist. Caller `app/admin/_actions/users.ts:47` does `buildInviteUrl(email, token)` — uses default. Today safe; but the function signature invites abuse — if any future caller passes user-controlled input, it could inject `../`/`\n` into the URL and produce a confused-deputy phishing URL via `${base}/${locale}/accept-invite`.

**Fix:** Type the parameter as `Locale` and validate at the boundary (or remove the parameter entirely since the only caller uses the default).

---

### M5 — `app/[locale]/accept-invite/page.tsx` leaks information about which invites exist

**File:** `app/[locale]/accept-invite/page.tsx:39-57`

**Evidence:** Different error messages for "token doesn't exist", "email mismatch", "revoked", "used", "expired". An attacker who knows or guesses a valid token can probe email values to find which one maps to it. Token entropy (256-bit) makes this practically infeasible, but the principle of "uniform error for invalid invite link" is standard.

**Why it matters:** Minor. Reduces info-leak surface for completeness.

**Fix:** Collapse to one generic "Invalid or expired invite. Contact your admin." for non-token-found cases. Keep "this invite has been used" and "expired" only if you specifically want to help legitimate users; otherwise unify.

---

### M6 — `getAuditEntities()` / `getAuditActions()` re-execute on every page render

**File:** `app/admin/_actions/audit-queries.ts:129-146`

**Evidence:** Two unbounded `SELECT DISTINCT` queries with no `LIMIT`, fired on every audit-page load. Audit log grows monotonically (180-day retention helps cap). For 100k+ rows this is a sequential scan twice per page-view.

**Why it matters:** Becomes a real cost as audit volume grows. Not urgent.

**Fix:** Wrap in `"use cache"` with `cacheTag("audit")` + `cacheLife("hours")` and invalidate the tag on writes via `revalidateTag` in the audit logger. Or hardcode the enum (your `ACTION_COLORS` map at `audit-columns.tsx:4` already enumerates them statically).

---

### M7 — `Service` JSON-LD cast via `unknown` defeats the typing it's supposed to provide

**File:** `lib/seo/jsonld.tsx:149-168`

**Evidence:** `as unknown as WithContext<Service>` to bypass `schema-dts` strictness on `ServiceLeaf`. The cast loses the validation `schema-dts` was meant to give you, and the comment explains *why* but doesn't validate the *output*. Google Rich Results Test will accept the JSON regardless because it's a structurally valid Service object — but the safety net is gone.

**Why it matters:** If Service object shape drifts, no compile-time error. Run Rich Results Test once and re-run on every schema change.

**Fix:** Either drop `inLanguage` from the Service builder (it's not present in the current output anyway) and keep the typed return, or use `as WithContext<Service>` directly without `unknown` — schema-dts will complain at exactly the field that's wrong, which is the value of the type.

---

## LOW

### L1 — `OG image` for product detail uses VI strings (`tag={p?.cat ?? "Tin tức"}` for news; product axes/display) regardless of locale

**File:** `app/[locale]/products/[slug]/opengraph-image.tsx:23`, `news/[slug]/opengraph-image.tsx:22`

**Evidence:** The OG image template renders raw entity strings — `p.axes` is `"3 trục"` or `"3 axis"` depending on what's stored. For news, `tag={n?.cat ?? "Tin tức"}` falls back to a VI hardcoded string. EN visitors sharing a news link will see "Tin tức" as the category label.

**Fix:** Pass `locale` and use it for fallback strings; or load `messages/{locale}/seo.json` keys for fallback labels.

---

### L2 — Invite URL omits scroll/query preservation guarantee from plan

**File:** `app/[locale]/accept-invite/page.tsx`, `set-password-form.tsx:44`

After accepting, `router.replace("/admin/dashboard")` uses `next/navigation`, not the i18n router. With `localePrefix: "as-needed"` and VI as default, this works; an EN admin doesn't really exist. Fine for MVP but inconsistent with the i18n-router pattern used elsewhere.

---

### L3 — `lib/email/templates/admin-invite.tsx:37` hardcodes `lang="vi"` and Vietnamese body text

**Evidence:** Invite email is bilingually relevant (you might invite an English-speaking integrator), but the template is VI-only with no locale parameterization. Phase 8 i18n EN was supposed to cover this surface ("admin invite email"), but the template's text is hardcoded.

**Fix:** Accept `locale` in `AdminInviteProps`, branch text or load via a server-side translation helper.

---

### L4 — `app/sitemap.ts` `lastModified: new Date()` is always now

**Evidence:** Every entity gets `lastModified = new Date()` — the timestamp the sitemap was generated, not when content actually changed. Search engines use `lastmod` as a refetch hint; emitting "now" for every URL on every sitemap generation defeats the purpose.

**Fix:** Pull `updatedAt` from each entity row and use that. For static pages, hardcode a build-time constant or omit `lastModified` to let search engines schedule on their own.

---

## NIT

### N1 — `app/admin/audit/page.tsx:24` ignores `await requireRole(["admin"])` return value
Doesn't matter, just dead code.

### N2 — `lib/seo/jsonld.tsx:53` cast `as SearchAction` after constructing with literal — the comment on line 54 says schema-dts uses string literals, but the cast is from the same shape, so it's redundant.

---

## What Was Done Right (no fix needed)

- **Token model is correct.** Plaintext 256-bit token in URL (`randomBytes(32).base64url`), SHA-256 hex in DB (`invite.tokenHash`). Hash recomputed for lookup. No plaintext persists. (`lib/auth/invite-token.ts`, `users.ts:142`)
- **Atomic claim using `UPDATE…RETURNING`** with the full guard set: `tokenHash`, `email`, `usedAt IS NULL`, `expiresAt > now()`, `revoked = false`. (`users.ts:147-159`)
- **GET on `/accept-invite` does NOT mark the invite used** — explicit `SELECT`-only validation. Outlook ATP / Slack URL previewers won't burn the invite. (`app/[locale]/accept-invite/page.tsx:13` comment + read-only query)
- **`accept-invite` route is at `app/[locale]/accept-invite`, not in an `(auth)` route group** — addresses F14 hardening note.
- **Centralized URL generation** via `lib/auth/invite-url.ts` — email template and route can never drift.
- **Server Actions = CSRF-protected** by Next.js' built-in mechanism. No manual `/api/accept-invite` endpoint was created — good. The only API route is the cron route, which is bearer-gated.
- **JSON-LD builders are typed** with `schema-dts WithContext<T>`. Product, Article, TechArticle, BreadcrumbList, FAQPage, Organization, WebSite all return correctly-shaped objects. (Service has a known cast — see M7.)
- **`localePrefix: "as-needed"` + hreflang triple in `buildAlternates`** is the right setup for VI-as-default with EN-prefixed.
- **i18n CI lint script** is well-designed: per-namespace comparison, catches both missing and extra keys, exits non-zero on drift. (`scripts/check-i18n-keys.ts`)
- **Audit retention cron** has bearer secret check and 180-day cutoff. Idempotent. (`app/api/cron/prune-audit/route.ts`)
- **No regressions to existing admin CRUD** (Phase 3-6 files). Verified via `git diff --stat` — only Phase 7 SEO additions touched public list/detail page files.
- **`requireRole` uses React `cache()`** to dedupe in a single render, and Better Auth `cookieCache` is enabled — admin pages won't N+1 the auth check.

---

## Summary of Required Actions

| ID | Severity | Action |
|---|---|---|
| C1 | CRITICAL | Add `nextCookies()` plugin to `lib/auth/server.ts` so `acceptInvite` actually logs the user in |
| C2 | CRITICAL | Remove `export const runtime = "edge"` from the three per-detail OG image routes |
| C3 | CRITICAL | Remove `<LocaleSwitcher />` from `admin-shell.tsx` OR build admin-scoped i18n provider |
| C4 | CRITICAL | Migrate `components/Header.tsx` to use `@/lib/i18n/navigation` Link + `usePathname`; translate hardcoded labels |
| H1 | HIGH | Restructure `acceptInvite` so Better Auth's user insert is not entangled with the Drizzle tx |
| H2 | HIGH | Validate `role` against an allowlist server-side in `inviteUser` / `changeUserRole` / `acceptInvite` |
| H3 | HIGH | `inviteUser` should reject existing-user emails and revoke prior unused invites |
| H4 | HIGH | Emit per-locale `<url>` entries in `app/sitemap.ts` with x-default in alternates |
| H5 | HIGH | Fix table/column names in `scripts/translate-data.ts` |
| H6 | HIGH | Simplify `audit/page.tsx:41` query-param assembly |
| M1-M7 | MEDIUM | Address as time permits before production launch |
| L1-L4, N1-N2 | LOW/NIT | Nice-to-have, non-blocking |

---

**Verdict:** REQUEST_CHANGES — C1, C2, C3, C4 are blocking for shipping; H1-H6 should be fixed before merge.

## Sources

- Better Auth Next.js integration (server-action cookies via `nextCookies` plugin): https://better-auth.com/docs/integrations/next
- Better Auth basic usage (autoSignIn behavior): https://better-auth.com/docs/basic-usage
- Better Auth issue: cookies not set when calling `signUpEmail` programmatically: https://github.com/better-auth/better-auth/issues/7034
