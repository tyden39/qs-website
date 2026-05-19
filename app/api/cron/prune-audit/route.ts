import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { auditLog } from "@/lib/db/schema/runtime";
import { lt, sql } from "drizzle-orm";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cutoff = sql`NOW() - INTERVAL '180 days'`;
    const deleted = await db
      .delete(auditLog)
      .where(lt(auditLog.createdAt, cutoff));

    // Drizzle returns rowCount on delete
    const count = (deleted as unknown as { rowCount?: number }).rowCount ?? 0;

    return NextResponse.json({ deleted: count, cutoffDays: 180 });
  } catch (err) {
    console.error("[prune-audit] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
