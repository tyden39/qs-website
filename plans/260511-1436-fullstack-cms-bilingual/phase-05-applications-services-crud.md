---
phase: 5
title: "Applications + Services CRUD"
status: pending
priority: P1
effort: "5d"
dependencies: [2]
execution: parallel
stream: C
---

# Phase 5: Applications + Services CRUD (Parallel Stream C)

## Overview

Build admin CRUD cho 2 entities tương đối tương tự (nested array forms): Applications (workflow steps, deployments, specs) + Services (process, included tiles, FAQs, pricing tiers). Combined trong 1 stream vì shape tương đồng và 1 dev có thể handle cả 2 trong 5d.

**Parallel execution:** Chạy đồng thời với Phase 3, 4, 6, 7, 8, 9. Reuses Phase 3 form + Server Action pattern (now using `defineAdminAction` HOF per F5).

**Red Team Session 2 updates:**
- F5: All Server Actions wrap with `defineAdminAction` HOF (Phase 2 created).
- F8: Hero image / deployment image uploads use Vercel Blob client-direct-upload.
- F11: i18n keys in `messages/vi/{application,service,admin-applications,admin-services}.json`.

## File Ownership

- `app/admin/applications/*`
- `app/admin/services/*`
- `app/admin/_actions/applications.ts`
- `app/admin/_actions/services.ts`
- `lib/validation/application-schema.ts`
- `lib/validation/service-schema.ts`

**Reads from:**
- `lib/db/schema/catalog.ts` (applications + services tables — FROZEN)
- `lib/data/{applications,services}.ts` (Phase 2)
- Shared helpers (audit, upload)

**Writes to:**
- `messages/vi.json` → `application.*` + `service.*` namespaces

## Requirements

**Functional:**
- Applications CRUD: slug, title, summary, hero_image, workflow array of {step, title, desc}, specs array of {l, v}, deployments array of {client, location, year, image}
- Services CRUD: slug, title, hero, process array, included array, faqs array of {q, a}, tiers array of {name, price, features}
- Bilingual VI/EN cho all text fields
- Useable image uploads (single hero_image + per-deployment image)
- useFieldArray nested arrays với reorder (drag-and-drop optional, defer if time tight)

**Non-functional:**
- Forms collapsible per nested item (UX với 5+ entries)
- "Add another" buttons
- Validation Zod cho nested arrays

## Architecture

```
app/admin/applications/
├── page.tsx
├── new/page.tsx
├── [id]/edit/page.tsx
└── _components/
    ├── application-form.tsx     workflow + specs + deployments useFieldArray
    ├── application-columns.tsx
    └── deployment-card.tsx      collapsible nested editor

app/admin/services/
├── page.tsx
├── new/page.tsx
├── [id]/edit/page.tsx
└── _components/
    ├── service-form.tsx         process + included + faqs + tiers
    ├── service-columns.tsx
    └── pricing-tier-card.tsx

app/admin/_actions/
├── applications.ts
└── services.ts
```

**Nested array pattern (FROZEN — reused 6+ times trong 2 forms):**
```tsx
const { fields, append, remove, move } = useFieldArray({ control, name: 'deployments' });

{fields.map((field, idx) => (
  <Collapsible key={field.id}>
    <CollapsibleTrigger>{watch(`deployments.${idx}.client`) || `Deployment #${idx + 1}`}</CollapsibleTrigger>
    <CollapsibleContent>
      <Input {...register(`deployments.${idx}.client`)} />
      <Input {...register(`deployments.${idx}.location`)} />
      ...
      <Button onClick={() => remove(idx)}>Xóa</Button>
    </CollapsibleContent>
  </Collapsible>
))}
<Button onClick={() => append({ client: '', location: '', year: '', image: '' })}>Add deployment</Button>
```

## Related Code Files

**Create (Applications):**
- `app/admin/applications/page.tsx` (overwrites Phase 2 STUB)
- `app/admin/applications/new/page.tsx`
- `app/admin/applications/[id]/edit/page.tsx`
- `app/admin/applications/_components/application-form.tsx`
- `app/admin/applications/_components/application-columns.tsx`
- `app/admin/applications/_components/deployment-card.tsx`
- `app/admin/_actions/applications.ts`
- `lib/validation/application-schema.ts`

**Create (Services):**
- `app/admin/services/page.tsx`
- `app/admin/services/new/page.tsx`
- `app/admin/services/[id]/edit/page.tsx`
- `app/admin/services/_components/service-form.tsx`
- `app/admin/services/_components/service-columns.tsx`
- `app/admin/services/_components/pricing-tier-card.tsx`
- `app/admin/_actions/services.ts`
- `lib/validation/service-schema.ts`

**Modify:**
- `messages/vi.json` → `application.*` + `service.*` keys

## Implementation Steps

1. **Applications: Zod + Server Actions + Form + List** — pattern y hệt Phase 3
   - Zod: workflow array of {step int, title {vi,en}, desc {vi,en}}, specs array of {l {vi,en}, v {vi,en}}, deployments array of {client, location, year, image}
   - useFieldArray cho 3 nested arrays, collapsible UI

2. **Services: Zod + Server Actions + Form + List**
   - Zod: process array of {step int, title {vi,en}, desc {vi,en}}, included array of {title {vi,en}, icon}, faqs array of {q {vi,en}, a {vi,en}}, tiers array of {name {vi,en}, price, features {vi,en}[]} max 3 tiers
   - PricingTierCard component for tier editing (3 fixed cards or dynamic)

3. **List pages** — TanStack Table, columns: slug / title.vi / status / updatedAt / actions

4. **Server Actions** — reuse pattern from Phase 3, revalidateTag per entity

5. **i18n keys** — add `application.*` + `service.*` namespaces

6. **Smoke test**
   - Create application với 5 deployments, 10 specs, 4 workflow steps
   - Edit reorder workflow steps → save → public page reflect order
   - Create service với 3 pricing tiers, 8 FAQs
   - Audit log captures diffs cho nested arrays

## Success Criteria

- [ ] Applications CRUD đầy đủ với nested arrays (workflow, specs, deployments)
- [ ] Services CRUD đầy đủ với pricing tiers + FAQs
- [ ] Bilingual VI/EN tabs work
- [ ] Collapsible nested cards UX
- [ ] `revalidateTag('applications')` + `revalidateTag('services')` work
- [ ] Audit log captures full nested diff
- [ ] Public detail pages render từ DB đúng order
- [ ] `tsc --noEmit` pass

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Nested array form (deployments × N) phức tạp | Collapsible cards, "Add another" button, drag-reorder defer if time tight |
| Services pricing 3 tiers — fixed hay dynamic? | MVP: dynamic max 3, validate Zod `.max(3)`. UI hint "Up to 3 pricing tiers" |
| Audit diff trên nested arrays lớn | Truncate diff jsonb > 50KB → store summary "+ N items added, M modified" |
| FAQ q/a có thể chứa rich text? | MVP plain text. If admin requests, defer to Phase 11 |
| Workflow step order critical | Zod ensures `step` is sequential int. Sort by `step` in render |
| Combined stream cho 2 entities — solo dev OK? | Same pattern, copy-adapt. Estimated ~2.5d each. Buffer 5d acceptable |

## Parallel Coordination Notes

- **No dependency on other Phase 3–9 streams.**
- **Reference Phase 3 patterns** (form, action, image upload)
- **Phase 7 SEO** adds metadata to public pages — Phase 5 không touch
- **Phase 8 i18n EN** translates `application.*` + `service.*` keys
