import { db } from "@/lib/db/client";
import { auditLog } from "@/lib/db/schema/runtime";

export type AuditEntry = {
  actorUserId: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  diff?: unknown;
};

// Call from inside defineAdminAction handlers (or within an explicit
// transaction) — passing the tx keeps the audit row atomic with the change.
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function logAudit(entry: AuditEntry, tx?: Tx): Promise<void> {
  const target = tx ?? db;
  await target.insert(auditLog).values({
    actorUserId: entry.actorUserId,
    action: entry.action,
    entity: entry.entity,
    entityId: entry.entityId ?? null,
    diff: entry.diff ?? null,
  });
}
