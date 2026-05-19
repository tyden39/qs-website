"use server";

import { revalidateTag } from "next/cache";
import { eq, desc, and, inArray } from "drizzle-orm";
import { defineAdminAction } from "@/lib/auth/define-admin-action";
import { db } from "@/lib/db/client";
import { lead } from "@/lib/db/schema/runtime";
import { leadStatusUpdate } from "@/lib/validation/lead-schema";
import { logAudit } from "@/app/admin/_actions/audit";

export const updateLeadStatus = defineAdminAction(
  ["admin", "editor"],
  async ({ session, tx }, id: number, raw: unknown) => {
    const data = leadStatusUpdate.parse(raw);

    // Fetch current for diff
    const [current] = await tx.select().from(lead).where(eq(lead.id, id));
    if (!current) throw new Error(`Lead not found: ${id}`);

    const [row] = await tx
      .update(lead)
      .set({
        status: data.status,
        ...(data.assignedTo !== undefined ? { assignedTo: data.assignedTo } : {}),
      })
      .where(eq(lead.id, id))
      .returning();

    await logAudit(
      {
        actorUserId: session.user.id,
        action: "update_status",
        entity: "lead",
        entityId: String(id),
        diff: { from: { status: current.status }, to: { status: data.status } },
      },
      tx,
    );
    revalidateTag("leads", "default");
    return row;
  },
);

// Admin reads — no cache (live inbox data)
export async function adminListLeads(filters?: {
  status?: string;
  source?: string;
  limit?: number;
  offset?: number;
}) {
  const conditions = [];
  if (filters?.status) conditions.push(eq(lead.status, filters.status));
  if (filters?.source) conditions.push(eq(lead.source, filters.source));

  const query = db
    .select()
    .from(lead)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(lead.createdAt))
    .limit(filters?.limit ?? 50)
    .offset(filters?.offset ?? 0);

  return query;
}

export async function adminGetLead(id: number) {
  const [row] = await db.select().from(lead).where(eq(lead.id, id));
  return row ?? null;
}

export async function adminGetLeadAuditHistory(leadId: number) {
  const { auditLog } = await import("@/lib/db/schema/runtime");
  return db
    .select()
    .from(auditLog)
    .where(
      and(eq(auditLog.entity, "lead"), eq(auditLog.entityId, String(leadId))),
    )
    .orderBy(desc(auditLog.createdAt));
}

