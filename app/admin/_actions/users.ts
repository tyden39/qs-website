"use server";

import { db } from "@/lib/db/client";
import { invite } from "@/lib/db/schema/runtime";
import { user } from "@/lib/db/schema/auth";
import { eq, and, isNull, gt } from "drizzle-orm";
import { createHash } from "crypto";
import { defineAdminAction } from "@/lib/auth/define-admin-action";
import { logAudit } from "@/app/admin/_actions/audit";
import { generateInviteToken } from "@/lib/auth/invite-token";
import { buildInviteUrl } from "@/lib/auth/invite-url";
import { sendEmail } from "@/lib/email/send";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";

const INVITE_TTL_HOURS = 24;

// Server-side allowlist — never trust client to pick role. The default
// "customer" role exists for self-signup paths but is never assignable here.
const ALLOWED_INVITE_ROLES = new Set(["admin", "editor"]);
const ALLOWED_USER_ROLES = new Set(["admin", "editor", "customer"]);

function assertInviteRole(role: string): void {
  if (!ALLOWED_INVITE_ROLES.has(role)) {
    throw new Error(`Invalid role: ${role}`);
  }
}

function assertUserRole(role: string): void {
  if (!ALLOWED_USER_ROLES.has(role)) {
    throw new Error(`Invalid role: ${role}`);
  }
}

// ---------------------------------------------------------------------------
// inviteUser — admin only
// ---------------------------------------------------------------------------
export const inviteUser = defineAdminAction(
  ["admin"],
  async ({ session, tx }, args: { email: string; name: string; role: string }) => {
    const { email, name, role } = args;
    assertInviteRole(role);

    // Reject if the email already corresponds to an active user — Better Auth
    // signUpEmail would later fail with "User exists" AFTER the atomic claim
    // consumed the invite, locking the recipient out.
    const [existing] = await tx
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, email))
      .limit(1);
    if (existing) throw new Error(`User with email ${email} already exists`);

    // Revoke any prior unused invites for this email so only one is live at a
    // time. Prevents earlier links staying valid for 24h after a re-send.
    await tx
      .update(invite)
      .set({ revoked: true })
      .where(and(eq(invite.email, email), isNull(invite.usedAt), eq(invite.revoked, false)));

    const { token, tokenHash } = generateInviteToken();
    const expiresAt = new Date(Date.now() + INVITE_TTL_HOURS * 60 * 60 * 1000);

    await tx.insert(invite).values({
      email,
      tokenHash,
      role,
      expiresAt,
      createdBy: session.user.id,
    });

    await logAudit(
      {
        actorUserId: session.user.id,
        action: "invite",
        entity: "user",
        entityId: email,
        diff: { role, name },
      },
      tx,
    );

    const inviteUrl = buildInviteUrl(email, token);

    await sendEmail({
      to: email,
      template: "admin-invite",
      subject: "Lời mời tham gia QS Technology Admin Console",
      props: {
        inviteUrl,
        role,
        inviterName: session.user.name ?? undefined,
        expiresInHours: INVITE_TTL_HOURS,
      },
    });
  },
);

// ---------------------------------------------------------------------------
// changeUserRole — admin only
// ---------------------------------------------------------------------------
export const changeUserRole = defineAdminAction(
  ["admin"],
  async ({ session, tx }, args: { userId: string; role: string }) => {
    const { userId, role } = args;
    assertUserRole(role);

    const [target] = await tx
      .select({ id: user.id, role: user.role })
      .from(user)
      .where(eq(user.id, userId));

    if (!target) throw new Error("User not found");

    await tx.update(user).set({ role }).where(eq(user.id, userId));

    await logAudit(
      {
        actorUserId: session.user.id,
        action: "role_change",
        entity: "user",
        entityId: userId,
        diff: { from: target.role, to: role },
      },
      tx,
    );
  },
);

// ---------------------------------------------------------------------------
// deactivateUser — admin only
// ---------------------------------------------------------------------------
export const deactivateUser = defineAdminAction(
  ["admin"],
  async ({ session, tx }, args: { userId: string }) => {
    const { userId } = args;

    if (userId === session.user.id) {
      throw new Error("Cannot deactivate your own account");
    }

    await tx
      .update(user)
      .set({ banned: true, banReason: "Deactivated by admin" })
      .where(eq(user.id, userId));

    await logAudit(
      {
        actorUserId: session.user.id,
        action: "deactivate",
        entity: "user",
        entityId: userId,
        diff: { banned: true },
      },
      tx,
    );
  },
);

// ---------------------------------------------------------------------------
// acceptInvite — PUBLIC action (no requireRole wrapper)
// Atomic claim: UPDATE...RETURNING guards against double-use.
// ---------------------------------------------------------------------------
export async function acceptInvite(args: {
  token: string;
  email: string;
  password: string;
  name: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { token, email, password, name } = args;

  if (!token || !email || !password || !name) {
    return { ok: false, error: "Thiếu thông tin bắt buộc" };
  }
  if (password.length < 8) {
    return { ok: false, error: "Mật khẩu phải có ít nhất 8 ký tự" };
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");

  // Phase A — atomic claim in a short transaction. If anything below fails, we
  // un-claim so the invite can be retried.
  let claimedRole: string;
  try {
    const [claimed] = await db
      .update(invite)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(invite.tokenHash, tokenHash),
          eq(invite.email, email),
          isNull(invite.usedAt),
          gt(invite.expiresAt, new Date()),
          eq(invite.revoked, false),
        ),
      )
      .returning();

    if (!claimed) {
      return { ok: false, error: "Invite invalid or already claimed" };
    }
    assertUserRole(claimed.role);
    claimedRole = claimed.role;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định";
    return { ok: false, error: message };
  }

  // Phase B — Better Auth signUp on its own connection (NOT inside our tx) so
  // the inserted user row is visible to subsequent role/audit writes. The
  // nextCookies plugin in lib/auth/server.ts forwards Set-Cookie through the
  // Server Action response so the caller is signed in on redirect.
  let newUserId: string;
  try {
    const res = await auth.api.signUpEmail({
      body: { email, password, name },
      headers: await headers(),
    });
    if (!res || !res.user) throw new Error("Failed to create account");
    newUserId = res.user.id;
  } catch (err) {
    // Roll back the claim so the recipient isn't locked out by a transient failure.
    await db
      .update(invite)
      .set({ usedAt: null })
      .where(and(eq(invite.tokenHash, tokenHash), eq(invite.email, email)));
    const message = err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định";
    return { ok: false, error: message };
  }

  // Phase C — apply the invite role + audit log. If role update affects zero
  // rows the user would remain with the default "customer" role and silently
  // lose admin access; surface this loudly.
  try {
    const updated = await db
      .update(user)
      .set({ role: claimedRole })
      .where(eq(user.id, newUserId))
      .returning({ id: user.id });
    if (updated.length !== 1) throw new Error("Role override failed");

    await logAudit({
      actorUserId: newUserId,
      action: "accept_invite",
      entity: "user",
      entityId: newUserId,
      diff: { email, role: claimedRole },
    });
    return { ok: true as const };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định";
    return { ok: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// listUsers — admin only (read helper called from server components)
// ---------------------------------------------------------------------------
export async function listUsers(filters: {
  role?: string;
  banned?: boolean;
} = {}) {
  const conditions = [];
  if (filters.role) conditions.push(eq(user.role, filters.role));
  if (filters.banned !== undefined) {
    conditions.push(eq(user.banned, filters.banned));
  }

  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      banned: user.banned,
      banReason: user.banReason,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
    .from(user)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(user.createdAt);

  return rows;
}
