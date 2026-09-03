# Deployment guide

The site is a static export served by Firebase Hosting. Deploying means building
a directory and uploading it — there is no server to restart, no migration to
run, no environment to warm.

---

## Target

| | |
|---|---|
| Host | Firebase Hosting |
| Project | `qstcnc-6207d` (`.firebaserc` default) |
| Deploy account | `qst.dev.admin@gmail.com` (pinned in the `deploy:prod` script) |
| Serving directory | `out/` |
| Production origin | `https://qstcnc.com` |
| Runtime | none — files only |

---

## Prerequisites

```bash
node -v          # 20.x, per .nvmrc
yarn -v          # 1.22.x
firebase --version
firebase login   # as the deploy account
```

`firebase-tools` is **not** a dependency of this repo; install it globally or
run it via `npx`.

---

## Environment

Both variables are `NEXT_PUBLIC_*`, so they are read at build time and inlined
into the generated HTML and client bundle. Changing either requires a rebuild —
there is nothing to reconfigure at runtime.

| Variable | Production value | Effect if wrong |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://qstcnc.com` | canonicals, hreflang, sitemap URLs and OG image URLs all point at the wrong origin; social previews break |
| `NEXT_PUBLIC_CRM_API_BASE` | `https://crm.qstcnc.com/api/v1` | the contact form posts nowhere, or to an origin the CSP blocks |

Both have code fallbacks (`https://qstcnc.com` and `https://crm.qstcnc.com/api/v1`
respectively), so a build with no env still emits real production URLs rather
than `localhost`. Do not rely on that — set them explicitly for anything but
production.

Local development uses `.env.local` (gitignored):

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CRM_API_BASE=https://crm.qstcnc.com/api/v1
```

---

## Build

```bash
yarn build
```

`prebuild` runs first and does two things, in order:

1. `tsx scripts/build-search-index.ts` → `public/search-index.vi.json` and
   `public/search-index.en.json`. Prints a record count and file size per locale.
2. `tsx scripts/generate-image-variants.ts` → the `-<width>w.webp` ladder beside
   every source image, plus `lib/media/image-manifest.json`. Prints how many
   images have variants and how many were re-encoded this run. Variants newer
   than their source are skipped, so repeat builds are fast; a cold build is the
   slow one — currently 454 source WebP files, 402 of which are large enough to
   produce variants, yielding around 1,600 generated files.

Then `next build` prerenders every route for both locales into `out/`.

A current build produces roughly 141 HTML files plus `_next/static`, the image
tree, the download library, the two search indexes, `sitemap.xml`, `robots.txt`
and `404.html`.

**The build is the test suite.** With no test framework in the repo, `yarn build`
is what catches: a message path in `CLIENT_MESSAGE_PATHS` that no longer
resolves (it throws by design), a route missing static params, a broken data
cast, and TypeScript errors across the whole tree.

Before building for production, also run:

```bash
yarn lint
yarn i18n:check     # if messages/ changed
```

---

## Deploy

```bash
yarn deploy:prod
```

Which is exactly:

```bash
yarn build && firebase deploy --only hosting \
  --project qstcnc-6207d --account qst.dev.admin@gmail.com
```

Firebase uploads only files whose hashes changed (the manifest of the last
upload is cached in `.firebase/`, which is gitignored).

### Preview before going live

```bash
firebase hosting:channel:deploy preview-<name> --project qstcnc-6207d
```

Creates a temporary channel with its own URL. Useful for content review. Note
that a preview channel serves from a different origin, so `NEXT_PUBLIC_APP_URL`
baked into canonicals will still point at production — fine for visual review,
misleading for SEO checks.

### Local check of the exported output

```bash
yarn build
npx serve out       # or: firebase emulators:start --only hosting
```

`npx serve` will **not** apply the redirect table or the security headers — those
are Firebase configuration, not files. Use the emulator when the redirects or
headers are what you are testing.

---

## Hosting configuration (`firebase.json`)

Everything Next cannot do under a static export lives here.

```json
"public": "out",
"trailingSlash": true,
"cleanUrls": false,
"appAssociation": "NONE",
"ignore": ["firebase.json", "**/.*", "**/node_modules/**", "_headers", "_redirects"]
```

`trailingSlash: true` must match `trailingSlash: true` in `next.config.mjs`, or
every canonical URL costs an extra redirect on crawl.

### Redirects — all 301

Next's `async redirects()` is not applied to a static export, so the whole table
is here.

| From | To | Why |
|---|---|---|
| `/` | `/vi/` | there is no unprefixed entry point; `localePrefix` is `"always"` |
| `/products`, `/products/*` | `/vi/electronics/*` | legacy unprefixed path + section rename |
| `/services`, `/news`, `/applications`, `/downloads`, `/about`, `/contact`, `/search` (and their `/*` where applicable) | `/vi/…` | legacy unprefixed paths |
| `/vi/products*`, `/en/products*` | `/vi|en/electronics/*` | section renamed Products → Electronics |
| `/vi/cnc*`, `/en/cnc*` | `/vi|en/machine-building/*` | section renamed CNC → Machine Building |
| `/vi/cnc/qsm-125`, `/en/cnc/qsm-125` | `…/machine-building/qsm-215/` | machine renamed; listed **before** the `/cnc/*` splats so it lands in one hop |

Two rules to preserve when editing:

- **Exact and splat come in pairs.** `/path/*` does not match `/path` itself, so
  every renamed section needs both entries.
- **`/downloads` has no splat.** The PDF library lives at `public/downloads/`,
  so a `/downloads/*` splat would 301 every actual file to a non-existent
  `/vi/downloads/*` and 404 the whole download library.

### Security headers

Applied to `**`:

| Header | Value |
|---|---|
| `Content-Security-Policy` | `default-src 'self'; img-src 'self' blob: data: https://i.ytimg.com; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self' https://crm.qstcnc.com; frame-src https://www.youtube-nocookie.com; frame-ancestors 'none'` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-Frame-Options` | `DENY` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=()` |

Why each exception exists:

- `connect-src https://crm.qstcnc.com` — the contact form's only outbound POST.
  **If `NEXT_PUBLIC_CRM_API_BASE` ever changes, this must change with it**, or
  the form works locally and is blocked in production.
- `img-src https://i.ytimg.com` — YouTube poster stills for the showreel and
  product videos. `blob:`/`data:` cover in-page generated images.
- `frame-src https://www.youtube-nocookie.com` — embedded video players.
- `script-src 'unsafe-inline'` — required by Next's inline bootstrap and by the
  three deliberate parse-time scripts (saved-locale redirect, scroll-reveal
  failsafe, 404 localiser) plus the filter pre-paint primer. Removing it breaks
  all four.

### Cache-Control

| Path | Value | Reason |
|---|---|---|
| `/_next/static/**` | `public, max-age=31536000, immutable` | content-hashed filenames |
| `/downloads/**` | `public, max-age=86400` | large PDFs, changed rarely |
| `/img/**` | `public, max-age=604800` | images are versioned by path |

HTML gets no explicit rule, so it falls to Firebase's default — which is what
lets a redeploy be visible immediately.

---

## Migration to Cloudflare Pages in progress

`public/_headers` and `public/_redirects` are **live Cloudflare Pages
configuration**, kept as the source of truth for `yarn deploy:prod` (which now
targets Cloudflare — see
[`cloudflare-deployment-guide.md`](./cloudflare-deployment-guide.md)). This
Firebase path is kept as `yarn deploy:firebase` for rollback during the
transition; `firebase.json` still lists both files in its `ignore` array so
Firebase itself never serves them.

Both tables encode the same redirects and security headers as `firebase.json`
below — **edit both together** until Firebase is fully decommissioned, at
which point `firebase.json` and `deploy:firebase` should be deleted and this
note removed.

---

## Post-deploy checks

```bash
curl -sI https://qstcnc.com/                    # expect 301 → /vi/
curl -sI https://qstcnc.com/vi/                 # expect 200 + CSP + nosniff
curl -sI https://qstcnc.com/products/           # expect 301 → /vi/electronics/
curl -sI https://qstcnc.com/vi/cnc/qsm-125      # expect 301 → /vi/machine-building/qsm-215/
curl -s  https://qstcnc.com/sitemap.xml | head
curl -sI https://qstcnc.com/search-index.vi.json  # expect 200 application/json
```

In a browser:

- `/vi/` and `/en/` both render, `<html lang>` matches.
- Header search returns results after the first keystroke (confirms the index
  fetch and Orama build).
- Contact form submits and returns success (confirms CRM reachability and the
  CSP `connect-src`).
- A product image's `srcset` lists distinct `-<width>w.webp` files, not the same
  URL repeated.
- View source on a detail page: canonical and `hreflang` carry the production
  origin, a locale prefix, and a trailing slash.

---

## Rollback

Firebase keeps previous hosting releases.

```bash
firebase hosting:releases:list --project qstcnc-6207d
firebase hosting:rollback --project qstcnc-6207d
```

Or roll the repository back and redeploy — the build is deterministic given the
same commit and the same env values, so `git checkout <sha> && yarn deploy:prod`
reproduces a known-good site.

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Contact form fails only in production | CRM origin missing from CSP `connect-src` in `firebase.json`, or `NEXT_PUBLIC_CRM_API_BASE` not set at build |
| Canonical/OG URLs say `localhost` | `NEXT_PUBLIC_APP_URL` unset **and** overridden somewhere; the code fallback is production, so this means it was set to a local value |
| Images all load at full resolution | `prebuild` did not run, or `lib/media/image-manifest.json` is stale — run `yarn img:variants` |
| Search returns nothing | `public/search-index.<locale>.json` missing from the deploy — run `yarn search:index`, confirm it is in `out/` |
| Build throws about a client message path | an entry in `CLIENT_MESSAGE_PATHS` no longer resolves; fix or remove it (this failure is intentional) |
| A URL 404s that used to work | check the redirect table — a renamed section needs both the exact and the splat rule |
| Every page returns 404 after deploy | `public` in `firebase.json` is not `out`, or the build produced no output |
| PDFs 404 | a `/downloads/*` splat was added to the redirect table |
| Reduced-motion or filter behaviour differs from dev | expected — `npx serve out` applies no Firebase headers; test with the emulator |
