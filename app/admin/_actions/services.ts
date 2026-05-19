"use server";

import { revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { defineAdminAction } from "@/lib/auth/define-admin-action";
import { service, type I18nText } from "@/lib/db/schema/catalog";
import { serviceSchema, type ServiceSchemaType } from "@/lib/validation/service-schema";
import { serviceSlugExists } from "@/lib/data/services";
import { logAudit } from "@/app/admin/_actions/audit";

export type ActionResult =
  | { ok: true; slug: string }
  | { ok: false; error: string };

// Next 16 revalidateTag requires a second profile argument
const REVALIDATE_PROFILE = {};

// Zod optional vi fields don't satisfy I18nText (vi required). Cast after DB-layer validation.
function toHero(h: ServiceSchemaType["hero"]): { headline: I18nText; subhead: I18nText; ctaPrimary?: I18nText; ctaSecondary?: I18nText } {
  return {
    headline: { vi: h.headline.vi, en: h.headline.en },
    subhead: { vi: h.subhead.vi, en: h.subhead.en },
    ctaPrimary: h.ctaPrimary?.vi ? { vi: h.ctaPrimary.vi, en: h.ctaPrimary.en } : undefined,
    ctaSecondary: h.ctaSecondary?.vi ? { vi: h.ctaSecondary.vi, en: h.ctaSecondary.en } : undefined,
  };
}

export const createService = defineAdminAction(
  ["admin", "editor"],
  async ({ session, tx }, input: ServiceSchemaType): Promise<ActionResult> => {
    const parsed = serviceSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Validation error" };
    }
    const data = parsed.data;

    const exists = await serviceSlugExists(data.slug);
    if (exists) {
      return { ok: false, error: `Slug "${data.slug}" already exists` };
    }

    await tx.insert(service).values({
      slug: data.slug,
      title: data.title,
      hero: toHero(data.hero),
      stats: data.stats,
      intro: data.intro,
      process: data.process,
      included: data.included,
      faqs: data.faqs,
      tiers: data.tiers,
      status: data.status,
      sort: data.sort,
      updatedBy: session.user.id,
    });

    await logAudit(
      {
        actorUserId: session.user.id,
        action: "create",
        entity: "service",
        entityId: data.slug,
        diff: data,
      },
      tx,
    );

    revalidateTag("services", REVALIDATE_PROFILE);
    return { ok: true, slug: data.slug };
  },
);

export const updateService = defineAdminAction(
  ["admin", "editor"],
  async (
    { session, tx },
    slug: string,
    input: ServiceSchemaType,
  ): Promise<ActionResult> => {
    const parsed = serviceSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Validation error" };
    }
    const data = parsed.data;

    if (data.slug !== slug) {
      const exists = await serviceSlugExists(data.slug, slug);
      if (exists) {
        return { ok: false, error: `Slug "${data.slug}" already exists` };
      }
    }

    await tx
      .update(service)
      .set({
        slug: data.slug,
        title: data.title,
        hero: toHero(data.hero),
        stats: data.stats,
        intro: data.intro,
        process: data.process,
        included: data.included,
        faqs: data.faqs,
        tiers: data.tiers,
        status: data.status,
        sort: data.sort,
        updatedBy: session.user.id,
      })
      .where(eq(service.slug, slug));

    await logAudit(
      {
        actorUserId: session.user.id,
        action: "update",
        entity: "service",
        entityId: data.slug,
        diff: data,
      },
      tx,
    );

    revalidateTag("services", REVALIDATE_PROFILE);
    revalidateTag(`service:${slug}`, REVALIDATE_PROFILE);
    if (data.slug !== slug) revalidateTag(`service:${data.slug}`, REVALIDATE_PROFILE);
    return { ok: true, slug: data.slug };
  },
);

export const deleteService = defineAdminAction(
  ["admin", "editor"],
  async ({ session, tx }, slug: string): Promise<ActionResult> => {
    await tx.delete(service).where(eq(service.slug, slug));

    await logAudit(
      {
        actorUserId: session.user.id,
        action: "delete",
        entity: "service",
        entityId: slug,
      },
      tx,
    );

    revalidateTag("services", REVALIDATE_PROFILE);
    revalidateTag(`service:${slug}`, REVALIDATE_PROFILE);
    return { ok: true, slug };
  },
);
