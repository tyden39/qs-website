"use server";

import { db } from "@/lib/db/client";
import { auditLog } from "@/lib/db/schema/runtime";
import { user } from "@/lib/db/schema/auth";
import {
  and,
  desc,
  gte,
  lte,
  eq,
  ilike,
  count,
  sql,
} from "drizzle-orm";

export interface AuditLogFilters {
  actor?: string;   // email substring
  entity?: string;
  action?: string;
  from?: string;    // ISO date string
  to?: string;      // ISO date string
  page?: number;
  pageSize?: number;
}

export interface AuditLogRow {
  id: number;
  actorUserId: string | null;
  actorEmail: string | null;
  actorName: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  diff: unknown;
  createdAt: Date;
}

export interface AuditLogResult {
  rows: AuditLogRow[];
  total: number;
}

export async function getAuditLog(
  filters: AuditLogFilters = {},
): Promise<AuditLogResult> {
  const {
    actor,
    entity,
    action,
    from,
    to,
    page = 0,
    pageSize = 50,
  } = filters;

  const conditions = [];

  if (entity) {
    conditions.push(eq(auditLog.entity, entity));
  }
  if (action) {
    conditions.push(eq(auditLog.action, action));
  }
  if (from) {
    conditions.push(gte(auditLog.createdAt, new Date(from)));
  }
  if (to) {
    // Include the full "to" day by advancing to end of day
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    conditions.push(lte(auditLog.createdAt, toDate));
  }

  // actor filter: join with user and filter by email substring
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const offset = page * pageSize;

  // Build base query with left join on user
  const rows = await db
    .select({
      id: auditLog.id,
      actorUserId: auditLog.actorUserId,
      actorEmail: user.email,
      actorName: user.name,
      action: auditLog.action,
      entity: auditLog.entity,
      entityId: auditLog.entityId,
      diff: auditLog.diff,
      createdAt: auditLog.createdAt,
    })
    .from(auditLog)
    .leftJoin(user, eq(auditLog.actorUserId, user.id))
    .where(
      actor
        ? and(whereClause, ilike(user.email, `%${actor}%`))
        : whereClause,
    )
    .orderBy(desc(auditLog.createdAt))
    .limit(pageSize)
    .offset(offset);

  // Count total for pagination
  const [{ value: total }] = await db
    .select({ value: count() })
    .from(auditLog)
    .leftJoin(user, eq(auditLog.actorUserId, user.id))
    .where(
      actor
        ? and(whereClause, ilike(user.email, `%${actor}%`))
        : whereClause,
    );

  return {
    rows: rows.map((r) => ({
      ...r,
      diff: r.diff ?? null,
      // Ensure createdAt is always a Date (Drizzle returns Date from timestamp)
      createdAt: r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt as string),
    })),
    total: Number(total),
  };
}

/**
 * Distinct entity values for filter dropdown — cached at call site.
 */
export async function getAuditEntities(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ entity: auditLog.entity })
    .from(auditLog)
    .orderBy(auditLog.entity);
  return rows.map((r) => r.entity);
}

/**
 * Distinct action values for filter dropdown.
 */
export async function getAuditActions(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ action: auditLog.action })
    .from(auditLog)
    .orderBy(auditLog.action);
  return rows.map((r) => r.action);
}
