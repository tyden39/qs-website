# Cloudflare Pages deployment guide

How to go from a clean checkout to a working deploy on Cloudflare Pages,
written for someone doing it for the first time. The site itself does not
change: this is still the same static export described in
[`deployment-guide.md`](./deployment-guide.md) (Firebase Hosting) — Cloudflare
Pages just serves the same `out/` directory from a different host, using its
own native config files instead of `firebase.json`.

The project is currently **mid-migration**: `yarn deploy:prod` targets
Cloudflare, `yarn deploy:firebase` still targets the old Firebase project as a
fallback. Once Cloudflare is confirmed stable in production, `firebase.json`
and `deploy:firebase` should be deleted and this note removed.

---

## Target

| | |
|---|---|
| Host | Cloudflare Pages |
| Project name | `qs-shop` |
| Serving directory | `out/` |
| Config format | `public/_headers`, `public/_redirects` (copied into `out/` by the Next export) |
| Runtime | none — static files only, same as Firebase |
| Default URL | `https://qs-shop.pages.dev` (production branch) |
| Preview URLs | `https://<branch>.qs-shop.pages.dev` per non-production branch, `https://<hash>.qs-shop.pages.dev` per deploy |

---

## 0. Prerequisites

```bash
nvm use && yarn install     # Node 20 per .nvmrc, yarn 1.22.x
```

`wrangler` is a devDependency of this repo (added for this migration) — no
global install needed, `yarn add -D wrangler` already ran once. Confirm it's
there:

```bash
npx wrangler --version
```

---

## 1. Authenticate wrangler

Two ways, pick one:

**Interactive login** (opens a browser):
```bash
npx wrangler login
```

**API token** (no browser, works over SSH/CI): create a token at
https://dash.cloudflare.com/profile/api-tokens with Cloudflare Pages edit
permission, then:
```bash
export CLOUDFLARE_API_TOKEN=<token>
```

Verify either way with:
```bash
npx wrangler whoami
```
This must print an account name/ID before anything below will work.

---

## 2. Create the Pages project (one-time)

Only needed the first time ever, or if the project was deleted. Deploying to a
project name that doesn't exist yet fails with:
```
✘ [ERROR] The Pages project "qs-shop" does not exist.
```
Create it:
```bash
npx wrangler pages project create qs-shop --production-branch main
```

---

## 3. Environment

Same two variables that matter for Firebase matter here — they're
`NEXT_PUBLIC_*`, read at build time and inlined into the static HTML/JS.
Nothing is reconfigured at Cloudflare's end; a wrong value means rebuilding.

| Variable | Production value | Effect if wrong |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://qstcnc.com` | canonicals, hreflang, sitemap, OG images point at the wrong origin |
| `NEXT_PUBLIC_CRM_API_BASE` | `https://crm.qstcnc.com/api/v1` | contact form posts nowhere, or to an origin the CSP blocks |
| `NEXT_PUBLIC_API_LOGIN` | `https://crm.qstcnc.com/api/v1` | login modal / SSO ticket calls fail |
| `NEXT_PUBLIC_API_PORTAL` | real Portal URL | "Portal" menu link is wrong or disabled |
| `NEXT_PUBLIC_API_ERP` | real ERP URL | "ERP" menu link is wrong or disabled |

`.env.local` is gitignored and machine-specific — **check it points at real
production URLs before running `yarn deploy:prod` for anything that isn't a
throwaway infra test**. Building with `.env.local` full of `localhost` values
produces a real deploy where the contact form and login silently call
`localhost` from every visitor's browser.

---

## 4. Build

```bash
yarn build
```

Identical to the Firebase path — `prebuild` regenerates the search indexes and
image variants, then `next build` exports every route into `out/`. See
[`deployment-guide.md`](./deployment-guide.md#build) for what that actually
does; nothing about it changes for Cloudflare.

Confirm the Cloudflare config files made it into the export (they're plain
files under `public/`, so they always do, but worth checking once):
```bash
ls out/_headers out/_redirects
```

---

## 5. Deploy

```bash
yarn deploy:prod
```

Which is:
```bash
yarn build && wrangler pages deploy out
```

Expect output like:
```
Uploading... (3734/3734)
✨ Success! Uploaded 3734 files (107.49 sec)
✨ Uploading _headers
✨ Uploading _redirects
🌎 Deploying...
✨ Deployment complete! Take a peek over at https://<hash>.qs-shop.pages.dev
✨ Deployment alias URL: https://<branch>.qs-shop.pages.dev
```

Notes:
- The upload step regularly runs past 2 minutes on a full asset tree (product
  images, PDFs, both search indexes) — this is normal, not a hang.
- Deploying from a branch other than the project's production branch (`main`)
  publishes to a **preview alias** (`https://<branch>.qs-shop.pages.dev`), not
  the production URL. That's expected on `development` — merge to `main` (or
  pass `--branch main`) to publish to `https://qs-shop.pages.dev` / the custom
  domain.
- `wrangler` warns `Your working directory is a git repo and has uncommitted
  changes` if there are any — informational only, does not block the deploy.
  Pass `--commit-dirty=true` to silence it.

---

## 6. Custom domain

Cloudflare dashboard → **Workers & Pages** → `qs-shop` → **Custom domains** →
add the production domain (e.g. `qstcnc.com`). DNS for that domain needs to be
on Cloudflare (nameservers, or a CNAME to the `.pages.dev` target if only
partially delegated) — the dashboard flow tells you which is missing.

---

## 7. CRM CORS

The contact form, login, and SSO all call
`{NEXT_PUBLIC_CRM_API_BASE}/...` directly from the browser — this is
unrelated to which static host serves the HTML, so switching hosts changes
nothing about how those calls work **except** that the CRM's CORS allowlist
keys off the calling origin. Add every origin that will actually serve
traffic:
- the custom production domain (`https://qstcnc.com`)
- `https://qs-shop.pages.dev` (useful for testing straight off Cloudflare
  before the custom domain is wired up)
- any preview branch domain you intend to test the form/login from

Missing this produces a CORS failure in the browser console that looks like a
CSP block but isn't — check `connect-src` first (below), then CORS.

---

## Hosting configuration (`public/_headers`, `public/_redirects`)

Cloudflare Pages reads these two plain-text files straight out of the deploy
directory — no dashboard config, no build step needed beyond copying them
into `out/`, which the Next export does automatically because they live under
`public/`.

They are functionally equivalent to the `firebase.json` `redirects`/`headers`
blocks documented in
[`deployment-guide.md`](./deployment-guide.md#hosting-configuration-firebasejson):
same 301 table (legacy unprefixed paths, `/products` → `/electronics`, `/cnc`
→ `/machine-building`, the one renamed machine slug), same CSP/security
headers, same Cache-Control tiers. `public/_headers` additionally sets
`Strict-Transport-Security: max-age=31536000`, which `firebase.json` does not.

**Keep both tables in sync while both hosts are live.** A redirect or CSP
change made in one and not the other means the two hosts serve different
behavior for the same URL.

### Redirects — rules to preserve when editing

- **Exact and splat come in pairs.** `/path/*` does not match `/path` itself,
  so a renamed section needs both entries.
- **`/downloads` has no splat.** The PDF library is static files under
  `public/downloads/`; a `/downloads/*` splat would 301 every real file to a
  nonexistent `/vi/downloads/*` and 404 the whole library.

### CSP `connect-src`

If `NEXT_PUBLIC_CRM_API_BASE` (or `_LOGIN`) ever changes, `connect-src` in
`public/_headers` must change with it, or the form/login work in `yarn dev`
and are silently blocked by the browser in production.

---

## Preview before going live

```bash
npx wrangler pages deploy out --branch preview-<name>
```
Publishes to `https://preview-<name>.qs-shop.pages.dev` without touching the
production alias. Same caveat as the Firebase preview channels:
`NEXT_PUBLIC_APP_URL` baked into canonicals still points at production, so
this is fine for visual/content review but not for checking canonical URLs.

## Local check of the exported output

```bash
yarn build
npx wrangler pages dev out
```
Unlike `npx serve out`, `wrangler pages dev` **does** apply `_headers` and
`_redirects`, so it's the right way to test a redirect/header change locally
before deploying.

---

## Rollback

Cloudflare keeps every previous deployment. Dashboard → **Workers & Pages** →
`qs-shop` → **Deployments** → pick a prior one → **Rollback to this
deployment**. There is no CLI rollback command as of this writing — use the
dashboard, or redeploy a known-good commit:
```bash
git checkout <sha> && yarn deploy:prod
```

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `The Pages project "qs-shop" does not exist` | one-time setup step (§2) was skipped — run `wrangler pages project create qs-shop` |
| Deploy publishes but the production URL doesn't update | deployed from a non-production branch; check the project's production branch in the dashboard, or pass `--branch main` |
| Contact form / login fails only on the deployed site | `.env.local` had `localhost` values at build time, or the deployed origin is missing from CRM CORS, or missing from `connect-src` in `public/_headers` |
| Canonical/OG URLs say `localhost` | `NEXT_PUBLIC_APP_URL` was set to a local value for this build |
| A redirect or header works on Firebase but not Cloudflare (or vice versa) | `public/_redirects`/`public/_headers` and `firebase.json` have drifted — edit both during the migration window |
| `npx wrangler whoami` shows no account | not authenticated — re-run `wrangler login` or re-export `CLOUDFLARE_API_TOKEN` |
| Upload seems to hang | normal on a full asset tree (images + PDFs + search indexes); this repo's full deploy has taken ~110s for ~3,700 files — let it finish rather than re-running |
| Images all load at full resolution / search returns nothing | not a Cloudflare issue — `prebuild` didn't run or produced stale output; see the Firebase guide's [troubleshooting table](./deployment-guide.md#troubleshooting) |
