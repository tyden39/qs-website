"use server";

import { revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { defineAdminAction } from "@/lib/auth/define-admin-action";
import { application } from "@/lib/db/schema/catalog";
import { applicationSchema, type ApplicationSchemaType } from "@/lib/validation/application-schema";
import { applicationSlugExists } from "@/lib/data/applications";
import { logAudit } from "@/app/admin/_actions/audit";

export type ActionResult =
  | { ok: true; slug: string }
  | { ok: false; error: string };

// Next 16 revalidateTag requires a second profile argument
const REVALIDATE_PROFILE = {};

export const createApplication = defineAdminAction(
  ["admin", "editor"],
  async ({ session, tx }, input: ApplicationSchemaType): Promise<ActionResult> => {
    const parsed = applicationSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Validation error" };
    }
    const data = parsed.data;

    const exists = await applicationSlugExists(data.slug);
    if (exists) {
      return { ok: false, error: `Slug "${data.slug}" already exists` };
    }

    await tx.insert(application).values({
      slug: data.slug,
      title: data.title,
      summary: data.summary,
      heroImage: data.heroImage || null,
      workflow: data.workflow,
      specs: data.specs,
      deployments: data.deployments,
      status: data.status,
      sort: data.sort,
      updatedBy: session.user.id,
    });

    await logAudit(
      {
        actorUserId: session.user.id,
        action: "create",
        entity: "application",
        entityId: data.slug,
        diff: data,
      },
      tx,
    );

    revalidateTag("applications", REVALIDATE_PROFILE);
    return { ok: true, slug: data.slug };
  },
);

export const updateApplication = defineAdminAction(
  ["admin", "editor"],
  async (
    { session, tx },
    slug: string,
    input: ApplicationSchemaType,
  ): Promise<ActionResult> => {
    const parsed = applicationSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Validation error" };
    }
    const data = parsed.data;

    if (data.slug !== slug) {
      const exists = await applicationSlugExists(data.slug, slug);
      if (exists) {
        return { ok: false, error: `Slug "${data.slug}" already exists` };
      }
    }

    await tx
      .update(application)
      .set({
        slug: data.slug,
        title: data.title,
        summary: data.summary,
        heroImage: data.heroImage || null,
        workflow: data.workflow,
        specs: data.specs,
        deployments: data.deployments,
        status: data.status,
        sort: data.sort,
        updatedBy: session.user.id,
      })
      .where(eq(application.slug, slug));

    await logAudit(
      {
        actorUserId: session.user.id,
        action: "update",
        entity: "application",
        entityId: data.slug,
        diff: data,
      },
      tx,
    );

    revalidateTag("applications", REVALIDATE_PROFILE);
    revalidateTag(`application:${slug}`, REVALIDATE_PROFILE);
    if (data.slug !== slug) revalidateTag(`application:${data.slug}`, REVALIDATE_PROFILE);
    return { ok: true, slug: data.slug };
  },
);

export const deleteApplication = defineAdminAction(
  ["admin", "editor"],
  async ({ session, tx }, slug: string): Promise<ActionResult> => {
    await tx.delete(application).where(eq(application.slug, slug));

    await logAudit(
      {
        actorUserId: session.user.id,
        action: "delete",
        entity: "application",
        entityId: slug,
      },
      tx,
    );

    revalidateTag("applications", REVALIDATE_PROFILE);
    revalidateTag(`application:${slug}`, REVALIDATE_PROFILE);
    return { ok: true, slug };
  },
);
