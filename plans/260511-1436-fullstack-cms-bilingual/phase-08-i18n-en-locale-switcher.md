---
phase: 8
title: "i18n EN + Locale Switcher"
status: completed
priority: P2
effort: "5d"
dependencies: [2]
execution: parallel
stream: F
---

# Phase 8: i18n EN Content + Locale Switcher (Parallel Stream F)

## Overview

Translate UI strings VI → EN (full `messages/en.json`), bootstrap EN content cho data fields, build public locale switcher, admin UI locale switcher, i18n CI lint script.

**Parallel execution:** Chạy đồng thời với Phase 3, 4, 5, 6, 7, 9. **Special coordination:** Phase 8 reads `messages/vi.json` keys added by other streams. Recommendation: Phase 8 starts day 3 (after streams have ~2d to add keys), or accept that Phase 8 will iterate as other streams add keys. Either way, the final `messages/en.json` must match all keys present in `messages/vi.json` (CI lint catches gaps).

## File Ownership (Updated Session 2 F11 — per-namespace structure)

- `messages/en/*.json` — mirrors `messages/vi/*.json` per-namespace structure (Phase 2 created `messages/vi/` split; Phase 8 creates the EN equivalents)
- `components/locale-switcher.tsx`
- `scripts/translate-data.ts` (AI-assist for entity translations)
- `scripts/check-i18n-keys.ts` (CI lint — now compares vi/*.json vs en/*.json file-by-file)
- `docs/i18n-glossary.md`

**Modify (specific surgical edits):**
- `components/Header.tsx` — mount LocaleSwitcher
- `app/admin/_components/admin-shell.tsx` — admin UI locale switcher in topbar
- `messages/vi.json` — Phase 8 may add keys EN-only contexts need (rare); generally NOT writing VI strings (other streams own those)

**Coordination rule:** Phase 8 final i18n EN translation pass happens AFTER all Phase 3–7 streams have stabilized their VI keys. Mid-stream Phase 8 can build infrastructure (locale switcher, scripts) + translate the keys that exist; final EN pass = day 4–5 of parallel window.

## Requirements

**Functional:**
- `messages/en.json` đầy đủ mọi key trong `messages/vi.json`
- Public Header có locale switcher (VI/EN, preserve current path + scroll)
- Admin UI locale switcher (chỉ admin language, không cho content language)
- Data EN bootstrap: ít nhất products + applications + services + news titles + excerpts (body có thể dịch sau)
- CI lint script: vi.json keys == en.json keys (deep)

**Non-functional:**
- Fallback EN→VI hoạt động khi EN còn null (already by `pickLocale` from Phase 2)
- Locale switcher preserve query params + scroll position
- Admin UI default VI, switch persistent (localStorage hoặc user preference DB)

## Architecture

```
messages/
├── vi.json                 full keys (other streams added throughout Phase 3–7)
└── en.json                 full keys translated (Phase 8 owns)

components/
└── locale-switcher.tsx     client component

scripts/
├── translate-data.ts       AI-assist batch translate entity fields → SQL UPDATE statements
└── check-i18n-keys.ts      CI lint: deep compare vi.json vs en.json keys

docs/
└── i18n-glossary.md        CNC/controller terminology glossary cho translator
```

**Locale switcher (FROZEN):**
```tsx
'use client';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useRouter } from '@/lib/i18n/routing';

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>{locale.toUpperCase()}</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => router.replace(pathname, { locale: 'vi' })}>Tiếng Việt</DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.replace(pathname, { locale: 'en' })}>English</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**Data EN bootstrap strategy:**
- Option A: Admin manually edit (slow, but most accurate)
- Option B: `scripts/translate-data.ts` — OpenAI/Claude API translate batch với glossary, output SQL UPDATE statements for review
- **Recommended:** Option B (draft) + manual review before applying SQL

**i18n CI lint:**
```ts
// scripts/check-i18n-keys.ts
function flatten(obj, prefix = ''): string[] { ... }
const viKeys = flatten(viJson).sort();
const enKeys = flatten(enJson).sort();
const missing = viKeys.filter(k => !enKeys.includes(k));
const extra = enKeys.filter(k => !viKeys.includes(k));
if (missing.length || extra.length) { console.error(...); process.exit(1); }
```

## Related Code Files

**Create:**
- `messages/en.json` (full translation)
- `components/locale-switcher.tsx`
- `scripts/translate-data.ts`
- `scripts/check-i18n-keys.ts`
- `docs/i18n-glossary.md`

**Modify:**
- `components/Header.tsx` — mount LocaleSwitcher
- `app/admin/_components/admin-shell.tsx` — admin UI locale switcher in topbar (coordinate với Phase 2 — Phase 2 may pre-mount placeholder)
- `package.json` — add `i18n:check` script

## Implementation Steps

1. **i18n CI lint script first**
   - Build `scripts/check-i18n-keys.ts` early (can run with whatever keys exist)
   - Add to `package.json` scripts: `"i18n:check": "tsx scripts/check-i18n-keys.ts"`

2. **Glossary file** (`docs/i18n-glossary.md`)
   - CNC terminology (machining center, axes, controller, etc.)
   - Brand voice (formal, B2B)
   - Domain-specific (PLC, HMI, servo, spindle, etc.)

3. **Locale switcher component**
   - Mount trong `components/Header.tsx` (desktop + mobile menu)
   - Use `useIntlRouter().replace(pathname, { locale })`

4. **Admin UI locale switcher**
   - Mount trong admin topbar (`app/admin/_components/admin-shell.tsx`)
   - Coordinate với Phase 2 (Phase 2 may already have placeholder slot)
   - Persistent: localStorage `admin-locale` or user preference

5. **EN UI string translation** (~100-200 keys)
   - Wait until day 3 of parallel window (other streams stabilize keys)
   - Manual translate `messages/en.json` (preferred for UI quality)
   - Reference glossary

6. **Data EN bootstrap script** (`scripts/translate-data.ts`)
   - Read products/news/applications/services from DB
   - For each VI field with null EN counterpart, call Claude API với glossary prompt
   - Output: SQL UPDATE statements to file `scripts/data-en-bootstrap.sql`
   - Manual review, then `psql -f scripts/data-en-bootstrap.sql`

7. **Run CI lint** — fix any key drift

8. **Verify**
   - Switch locale public → URL prefix correct, content fallback work where EN null
   - Admin UI locale switch persists
   - `yarn i18n:check` passes

## Success Criteria

- [ ] `messages/en.json` complete, no missing keys vs vi.json (CI script confirms)
- [ ] Public LocaleSwitcher in Header (desktop + mobile)
- [ ] Admin UI LocaleSwitcher in topbar, persistent
- [ ] EN content bootstrap: products + applications + services + news titles + excerpts (body deferred)
- [ ] `scripts/check-i18n-keys.ts` runnable, passes
- [ ] `docs/i18n-glossary.md` committed
- [ ] Fallback EN→VI hoạt động cho content fields còn null

## Risk Assessment

| Risk | Mitigation |
|---|---|
| EN translation chất lượng kém | Glossary file, manual review trước commit. AI translate = draft only |
| Phase 8 starts before other streams add keys | Build infrastructure (switcher, script, glossary) first; full translation pass day 4–5 |
| Locale switcher mất scroll/form state | `useIntlRouter().replace` preserve query, scroll restoration native Next.js |
| Translation drift giữa vi.json và en.json | CI check (also runs in Phase 10) |
| Data EN translate API cost | Batch trong 1 prompt, glossary instruction, est. < $5 USD |
| `scripts/translate-data.ts` overwrites manual edits | Script generates SQL file for review — never auto-applies |
| Admin UI switcher conflict với Phase 2 topbar | Phase 2 pre-allocates slot; Phase 8 fills component |

## Parallel Coordination Notes

- **Special timing:** Other streams add VI keys throughout. Phase 8 final pass = end of parallel window.
- **No file conflict** — `messages/en.json` owned exclusively; `vi.json` Phase 8 mostly reads.
- **Phase 2 coordination:** topbar locale switcher slot
- **Phase 10 (QA)** runs `yarn i18n:check` in CI gate
