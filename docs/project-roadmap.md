# Project roadmap

Written from what the code and content actually show, not from a plan. Two
sections:

- **Verified gaps** — reproducible today by reading a named file. These are
  statements of fact.
- **Suggestions** — proposals only. Nothing here is a commitment, and no dates or
  owners are assigned, because none exist in the repository.

Last regenerated from the tree on 2026-07-30.

---

## Verified gaps

### Content that is present but incomplete

| Gap | Evidence | Effect today |
|---|---|---|
| Controller taxonomy has three empty branches | `ControllerType` in `data/products.ts` is `"motion" \| "cnc" \| "robot" \| "cobot"`; all 7 rows in `data/products.json` are `"cnc"` | motion / robot / cobot browse branches render `controller-soon-panel.tsx` ("being prepared") |
| Machine taxonomy has an empty branch | `MachineCategory` and `MACHINE_TYPES` include `inspection`; no row in `data/machines.json` uses it | the inspection section never appears on the machines list |
| No workpiece photography | all 5 CNC machines (`qsm-215`, `vmc-300`, `qsm-r4020`, `pjm-420`, `jw-230`) carry 4 `capabilities` entries each, none with an `img` | the datasheet draws a blueprint-plate placeholder in all 20 slots |
| One controller has no overview prose | `astro-10s` is the only row in `data/products.json` without `overview` | its overview tab falls back to the shorter description |
| One series has no document library | `sch-motor` has 0 `documentation` entries; `sdv3` has 14, `s600` 10, `s3100` 23 | its Documentation tab is dropped |
| One application has no video | 8 of 9 rows in `data/applications.json` carry a `video`; `kim-hoan` does not | its detail page hides the video band |
| Only one service exists | `data/services.json` has one row (`retrofit`), and `messages/*/service.json` `detailData` has one key | the services list is a single card |

Translation coverage is **not** a gap: `yarn i18n:check` passes across all 15
namespaces, and every news article, machine, application and product carries its
English sibling fields.

### Content errors

| Error | Evidence |
|---|---|
| Organization JSON-LD publishes the wrong city | `lib/seo/jsonld.tsx` line 50 sets `addressLocality: "Hà Nội"`, while `components/Footer.tsx` gives a Hóc Môn, Ho Chi Minh City address and `messages/*/about.json` and `home.json` both say the factory is in Ho Chi Minh City. Search engines read the JSON-LD. |
| Marketing copy says six controllers, the catalogue publishes seven | "Sáu dòng controller" / "Six controller lines" appears in `messages/{vi,en}/seo.json`, `messages/{vi,en}/home.json` and `app/opengraph-image.tsx`; `data/products.json` has 7 rows |
| The 403 page links to a route that does not exist | `app/[locale]/403/page.tsx` renders a button to `/login`; there is no login route anywhere under `app/`, so the button 404s |

### Dead configuration

| Item | Evidence |
|---|---|
| `public/_headers` and `public/_redirects` are Cloudflare Pages leftovers | both are tracked in git, both are listed in the `ignore` array of `firebase.json`, so nothing serves them. `_redirects` also contradicts live behaviour: it states `/` is deliberately not redirected at the edge and that `app/page.tsx` detects locale client-side — there is no `app/page.tsx`, and `firebase.json` does 301 `/` to `/vi/`. |
| `robots.ts` disallows paths that do not exist | `/admin/`, `/api/`, `/account/`, `/login` — none are routes on this static site |
| An empty `test-results/` directory persists | `.gitignore` calls it "playwright test artifacts", but Playwright is not in `package.json` |

### Engineering gaps

| Gap | Evidence | Risk |
|---|---|---|
| No automated tests of any kind | no test runner in `package.json`; `jsdom` and `node-fetch` are used by tooling scripts | the only regression net is `yarn build`, `yarn lint` and `yarn i18n:check`. Search ranking, the CRM result mapping, the image loader's rung selection and the SEO URL builders are all pure functions with zero coverage. |
| No CI configuration in the repository | no `.github/workflows`, no other pipeline config | the gates above run only when someone remembers |
| Commit history is largely uninformative | most recent commits are the bare message `update` | bisecting and change archaeology are expensive |
| Two shared components are PascalCase | `components/Header.tsx`, `Footer.tsx`, `SearchPanel.tsx` against 21 kebab-case siblings | cosmetic, but it makes the convention ambiguous to newcomers |
| One cross-route private import | `machine-building/_components/line-machine-detail.tsx` imports `ProductVideo` from `electronics/_components/product-video` | a route-private component is being shared, which the `_components/` convention exists to prevent |
| Duplicate design token | `--color-gold-3` and `--color-gold-1` are both `#8a6f35` in `app/globals.css` | ambiguity about which to use |
| One stale code comment | the note beside `.qs-lede` calls the lede step 17px; the token is 18px and the class uses `text-title` (20px) | misleads a reader of the type scale |
| HSTS is not sent | `firebase.json` headers omit `Strict-Transport-Security`; the dead `public/_headers` had `max-age=31536000` | the header was lost in the move off Cloudflare |
| `data/series.json` is 320 KB | one file, parsed at build for every page that touches series | build cost and merge friction; it is also the file most often edited by the admin app |

---

## Suggestions

Everything below is a proposal. None of it is scheduled, assigned or committed.

### Suggested — correctness first

These are small, verifiable and carry no design debate.

1. Fix `addressLocality` in `lib/seo/jsonld.tsx` to match the published address,
   and consider adding `streetAddress` and `postalCode` so the Organization
   entity is complete.
2. Reconcile "six controller lines" with the seven published models — either
   update the copy in four files, or confirm that one model is intentionally not
   counted and say why in a comment.
3. Remove the `/login` button from the 403 page, or point it somewhere real.
4. Delete `public/_headers` and `public/_redirects`, after first porting
   `Strict-Transport-Security` into the `firebase.json` header block.
5. Trim `robots.ts` to paths that exist, or leave a comment explaining that the
   disallow list is defensive.
6. Delete the empty `test-results/` directory and its `.gitignore` entry unless
   Playwright is genuinely coming back.

### Suggested — a minimal test net

The site has no server, so the highest-value tests are pure-function unit tests
that need no browser and no fixtures:

| Candidate | Why it earns a test |
|---|---|
| `lib/search/engine.ts` — `foldDiacritics`, `fuzzyMatch`, `searchDb` ranking | the ranking has several tuned constants (field boosts, fuzzy weight, density gate, type weights); a regression here is silent and only visible as bad results |
| `lib/media/image-loader.ts` | rung selection is arithmetic against a manifest; an off-by-one ships full-resolution images to phones |
| `lib/seo/app-url.ts` + `alternates.ts` | canonical/hreflang consistency is exactly the kind of thing that breaks quietly and costs indexing |
| `lib/seo/text.ts` truncation | word-boundary cutting with a reserved ellipsis character has obvious edge cases |
| `lib/crm/leads-client.ts` status mapping | five outcomes, each with its own UI message |
| `lib/data/*.ts` view resolution | the `?? primary` fallback chain is the whole bilingual contract |

A runner would need to be chosen; nothing in the repository implies one today.
Whatever is chosen, `yarn build` should remain the gate that must pass.

### Suggested — CI

A pipeline running `yarn lint`, `yarn i18n:check` and `yarn build` on every push
would turn three manual habits into a guarantee. The build is the expensive step
(a cold image-variant pass over 454 source WebP files, producing roughly 1,600
variants), so caching `public/**/*-<w>w.webp` between runs would matter.

### Suggested — content pipeline

Content arrives as JSON from an internal admin application, which means a
content-only change still requires a checkout, a build and a deploy. Two
directions worth considering, in increasing order of cost:

- **Keep the model, shorten the loop.** A deploy triggered by a content commit
  would make the current arrangement acceptable for routine updates.
- **Validate at the boundary.** The JSON is cast with `as unknown as T[]`, so a
  malformed row from the admin app becomes a runtime shape error somewhere deep
  in a template. A zod (or equivalent) parse at the `data/*.ts` boundary would
  fail the build with the offending row named instead. This is the single
  highest-leverage change to content reliability, and it needs no new
  infrastructure.

Splitting `data/series.json` — one file per series — is also worth weighing. It
would cut merge friction on the file the admin app touches most, at the cost of a
small amount of glue in `data/series.ts`.

### Suggested — filling the empty branches

The motion / robot / cobot controller branches and the inspection machine branch
are product decisions, not engineering ones. The engineering side is already
built: adding a row with the right `type` or `category` makes the section appear.
Nothing needs to change in code to publish into them.

### Suggested — smaller cleanups

- Rename `Header.tsx`, `Footer.tsx`, `SearchPanel.tsx` to kebab-case in one
  commit; the import sites are `app/[locale]/layout.tsx` plus `Header`'s own
  imports.
- Promote `ProductVideo` to `components/` so `machine-building` stops reaching
  into `electronics/_components/`.
- Collapse `--color-gold-3` into `--color-gold-1`.
- Fix the `.qs-lede` comment.
- Adopt conventional commit messages consistently; the repository already has
  good examples (`feat(electronics): rework the servo/inverter catalogue
  presentation`) alongside a long run of `update`.

### Explicitly out of scope

Unless the hosting decision changes, anything requiring a request-time server —
server-side search, on-demand image optimisation, form handling in-house,
personalisation, A/B testing at the edge — is not on this roadmap. The static
export is the constraint the whole architecture is built around, and several
otherwise-odd design choices only make sense in its light.
