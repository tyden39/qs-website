"use server";

import { revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { defineAdminAction } from "@/lib/auth/define-admin-action";
import { db } from "@/lib/db/client";
import { datasheet } from "@/lib/db/schema/catalog";
import { datasheetInput, datasheetUpdate } from "@/lib/validation/datasheet-schema";
import { logAudit } from "@/app/admin/_actions/audit";

export const createDatasheet = defineAdminAction(
  ["admin", "editor"],
  async ({ session, tx }, raw: unknown) => {
    const data = datasheetInput.parse(raw);
    const [row] = await tx
      .insert(datasheet)
      .values({ ...data, updatedBy: session.user.id })
      .returning();
    await logAudit(
      { actorUserId: session.user.id, action: "create", entity: "datasheet", entityId: row.slug },
      tx,
    );
    revalidateTag("datasheets", "default");
    return row;
  },
);

export const updateDatasheet = defineAdminAction(
  ["admin", "editor"],
  async ({ session, tx }, slug: string, raw: unknown) => {
    const data = datasheetUpdate.parse(raw);
    const [row] = await tx
      .update(datasheet)
      .set({ ...data, updatedBy: session.user.id, updatedAt: new Date() })
      .where(eq(datasheet.slug, slug))
      .returning();
    if (!row) throw new Error(`Datasheet not found: ${slug}`);
    await logAudit(
      { actorUserId: session.user.id, action: "update", entity: "datasheet", entityId: slug, diff: data },
      tx,
    );
    revalidateTag("datasheets", "default");
    return row;
  },
);

export const deleteDatasheet = defineAdminAction(
  ["admin"],
  async ({ session, tx }, slug: string) => {
    const [row] = await tx
      .delete(datasheet)
      .where(eq(datasheet.slug, slug))
      .returning({ slug: datasheet.slug });
    if (!row) throw new Error(`Datasheet not found: ${slug}`);
    await logAudit(
      { actorUserId: session.user.id, action: "delete", entity: "datasheet", entityId: slug },
      tx,
    );
    revalidateTag("datasheets", "default");
    return { ok: true };
  },
);

// Admin read: all statuses, no cache (used by admin table)
export async function adminListDatasheets() {
  return db.select().from(datasheet).orderBy(datasheet.sort, datasheet.createdAt);
}
