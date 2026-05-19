import {
  pgTable,
  text,
  timestamp,
  jsonb,
  serial,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const lead = pgTable(
  "lead",
  {
    id: serial("id").primaryKey(),
    source: text("source").notNull(),
    name: text("name"),
    email: text("email").notNull(),
    phone: text("phone"),
    company: text("company"),
    message: text("message"),
    payload: jsonb("payload"),
    status: text("status").notNull().default("new"),
    assignedTo: text("assigned_to").references(() => user.id, { onDelete: "set null" }),
    locale: text("locale").notNull().default("vi"),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("lead_status_idx").on(t.status),
    index("lead_created_idx").on(t.createdAt),
  ],
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: serial("id").primaryKey(),
    actorUserId: text("actor_user_id").references(() => user.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: text("entity_id"),
    diff: jsonb("diff"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("audit_entity_idx").on(t.entity, t.entityId),
    index("audit_created_idx").on(t.createdAt),
  ],
);

// 180-day retention is enforced by a daily cron job.
export const invite = pgTable(
  "invite",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    role: text("role").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    revoked: boolean("revoked").notNull().default(false),
  },
  (t) => [
    index("invite_email_idx").on(t.email),
    index("invite_expires_idx").on(t.expiresAt),
  ],
);
