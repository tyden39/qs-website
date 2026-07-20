# Update CNC detail content from Google Sheets

Status: done

## Scope

- Map the five spreadsheet tabs to the existing CNC detail records:
  - `Máy QSM-215` → existing public model `QSM-125` (keep current model/slug; the sheet dimensions match the QSM-125 record)
  - `Máy VMC-300` → `vmc-300`
  - `Máy PJM` → `pjm-420`
  - `Máy QSM-R4020` → `qsm-r4020`
  - `Máy JW230` → `jw-230`
- Update technical specifications and any directly affected feature copy.
- Add machining materials and standard equipment from the workbook.
- Preserve current routes, page templates, images, and non-CNC work in progress.

## Files

- `data/machines.ts`
- `lib/data/machines.ts`
- `lib/data/machine-datasheet.ts`
- `messages/vi/cnc.json`
- `messages/en/cnc.json`

## Acceptance criteria

- All values published in the five workbook tabs appear on the matching CNC detail pages.
- Conflicting existing values use the workbook as source of truth.
- Vietnamese and English pages do not leak untranslated Vietnamese spec values.
- Existing CNC/automation routes and shared detail templates remain compatible.
- TypeScript, i18n key checks, and production build pass.

## Validation

1. `yarn i18n:check`
2. `yarn tsc --noEmit`
3. `yarn build`

## Notes

- The workbook tab says `QSM-215`, while the current site, assets, news, and local datasheet identify the product as `QSM-125`. This update supplements the existing QSM-125 page without renaming its public contract.
- The workbook provides no optional-equipment list, so those placeholders remain unchanged.

## Result

- `yarn i18n:check` PASSED (161 cnc keys).
- `yarn tsc --noEmit` clean.
- `yarn build` prerendered all `/vi/cnc/*` and `/en/cnc/*` detail routes without errors.
- `yarn lint` is unavailable because the existing script still calls `next lint`; Next treats `lint` as a project directory and exits before running a linter.

## Open questions

- Sheet tab is `QSM-215` but the model everywhere else is `QSM-125`. Kept `QSM-125`; confirm whether the model should be renamed.
- Sheet lists JW-230 / PJM controller as `QS Astro 10i`; prior data used 6AV. Adopted the sheet value — confirm the controller pairing.
