# Docs init — report

Clean regeneration of `docs/` plus a rewrite of the stale `README.md`, for
`qs-shop` (QS Technology website). No source, data, config or `issues.md` was
touched.

## Files created

| File | Lines | Limit |
|---|---:|---|
| `/home/ducnguyen/ws/qs/qs-website/README.md` | 178 | < 300 ✓ |
| `/home/ducnguyen/ws/qs/qs-website/docs/codebase-summary.md` | 261 | < 800 ✓ |
| `/home/ducnguyen/ws/qs/qs-website/docs/system-architecture.md` | 389 | < 800 ✓ |
| `/home/ducnguyen/ws/qs/qs-website/docs/code-standards.md` | 321 | < 800 ✓ |
| `/home/ducnguyen/ws/qs/qs-website/docs/design-guidelines.md` | 320 | < 800 ✓ |
| `/home/ducnguyen/ws/qs/qs-website/docs/deployment-guide.md` | 281 | < 800 ✓ |
| `/home/ducnguyen/ws/qs/qs-website/docs/project-overview-pdr.md` | 290 | < 800 ✓ |
| `/home/ducnguyen/ws/qs/qs-website/docs/project-roadmap.md` | 156 | < 800 ✓ |

## Validation performed

- All 4 Mermaid diagrams in `system-architecture.md` rendered successfully with
  `@mermaid-js/mermaid-cli` 11.16.0 (headless Chromium, `--no-sandbox`). Syntax
  is valid for v11.
- `yarn i18n:check` run to confirm the translation-parity claim (passes, 15
  namespaces).
- Entity counts, gap lists and file/LOC figures derived by reading the JSON and
  the tree directly, not from the scouting brief.

## Corrections made to the scouting brief

| Brief said | Actual |
|---|---|
| `public/` "2120 files (images, downloads)" implied ~1,900 source images | 454 source WebP files; 1,587 of the 2,120 are **generated** variants; 402 images have manifest entries |
| — | `electronics/_components/` holds 17 files, not 15 |

Everything else in the brief checked out.

## Findings surfaced (documented in `project-roadmap.md`)

Verifiable defects, each reproducible from a named file:

1. `lib/seo/jsonld.tsx:50` publishes `addressLocality: "Hà Nội"` in the
   Organization JSON-LD, while `components/Footer.tsx`, `messages/*/about.json`
   and `messages/*/home.json` all place the company in Ho Chi Minh City
   (Hóc Môn). Search engines read the JSON-LD.
2. Copy says "Sáu dòng controller" / "Six controller lines" in four places
   (`messages/{vi,en}/seo.json`, `messages/{vi,en}/home.json`,
   `app/opengraph-image.tsx`) while `data/products.json` publishes 7 controllers.
3. `app/[locale]/403/page.tsx` renders a button to `/login`; no login route
   exists anywhere under `app/`, so it 404s.
4. `public/_headers` and `public/_redirects` are tracked Cloudflare Pages
   leftovers, listed in the `ignore` array of `firebase.json` so nothing serves
   them, and `_redirects` actively contradicts live behaviour (it claims `/` is
   not redirected at the edge and that `app/page.tsx` handles locale detection —
   there is no `app/page.tsx`, and Firebase does 301 `/` → `/vi/`).
   `_headers` carries `Strict-Transport-Security`, which `firebase.json` does
   **not** — the header was lost in the host migration.
5. `robots.ts` disallows `/admin/`, `/api/`, `/account/`, `/login` — none exist.
6. `--color-gold-3` duplicates `--color-gold-1` (`#8a6f35`).
7. Stale comment beside `.qs-lede` calls the lede step 17px; the token is 18px
   and the class renders at 20px.
8. `machine-building/_components/line-machine-detail.tsx` imports `ProductVideo`
   from `electronics/_components/` — a route-private component being shared
   across routes.
9. Content gaps: 20 machine `capabilities` slots with no photo, `astro-10s`
   missing `overview`, `sch-motor` with 0 documents, `kim-hoan` with no video,
   `inspection` machine category and `motion`/`robot`/`cobot` controller types
   with no rows.

All are recorded as facts under "Verified gaps"; every proposed action is
separated into a "Suggestions" section with no dates or owners.

## Not done / could not verify

- **`repomix` was not run.** It is not installed, and `repomix-output.xml` is
  outside the list of files this task permitted creating. `codebase-summary.md`
  was written from direct reads of the tree instead.
- **`.claude/scripts/validate-docs.cjs` does not exist** in this repository, so
  the scripted link/reference validation could not be run. Internal doc links
  were kept to the seven files created here, all of which exist.
- **Firebase behaviour was not exercised live.** Redirect, header and
  Cache-Control claims come from reading `firebase.json`; the post-deploy `curl`
  checks in the deployment guide are written as instructions, not as results.
- **The CRM contract** (`5 req/min/IP`, the 201/400/429 status mapping, the
  service/business-group code lists) is documented from this repo's client and
  schema plus their references to `qs-crm docs/lead-form-page-guide.md §2`. The
  CRM repository itself was not available to cross-check.
- **`yarn build` was not run** as part of this task (no code was changed); the
  `out/` figures quoted (141 HTML files) come from the existing build artefacts
  in the working tree.

## Working-tree note for the caller

`git status` after this run shows deletions I did not make and did not restore —
they were already in the working tree when this task started (the session's
opening snapshot reported the tree clean, so the deletion happened between that
snapshot and this run):

- `docs/home-effects-and-motion.md` and `docs/i18n-glossary.md` existed in HEAD
  and are **not** among the eight files this task was permitted to create, so
  they remain deleted. Their subject matter is partly covered by the new
  `docs/design-guidelines.md` (motion) and `docs/code-standards.md` (the
  bilingual field convention), but any glossary term list they held is gone.
  Decide explicitly whether to restore them from git.
- The entire `plans/` tree (all plan directories and prior reports) also shows as
  deleted. Nothing in this run touched it apart from creating
  `plans/reports/docs-manager-260730-1913-docs-init.md`.

Every other change in `git status` is a file this task created.
