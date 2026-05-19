import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db/client";
import { lead } from "@/lib/db/schema/runtime";
import { leadInput } from "@/lib/validation/lead-schema";
import { checkFormRateLimit } from "@/lib/ratelimit";
import { sendEmail } from "@/lib/email/send";

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  // 1. Rate limit — sliding window 10/min per IP
  const ip = getClientIp(req);
  const allowed = await checkFormRateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait and try again." }, { status: 429 });
  }

  // 2. Parse + validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = leadInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const data = parsed.data;

  // 3. Honeypot check (redundant but explicit server-side guard)
  if (data.honeypot) {
    // Return 200 to not reveal bot detection to scrapers
    return NextResponse.json({ ok: true });
  }

  // 4. Strip honeypot before insert
  const { honeypot: _hp, ...insertData } = data;

  const userAgent = req.headers.get("user-agent") ?? undefined;

  // 5. Insert lead
  let newLead: typeof lead.$inferSelect;
  try {
    const [row] = await db
      .insert(lead)
      .values({
        ...insertData,
        payload: (insertData.payload as Record<string, unknown>) ?? null,
        ip,
        userAgent,
      })
      .returning();
    newLead = row;
  } catch (err) {
    console.error("[api/leads] DB insert failed:", err);
    return NextResponse.json({ error: "Failed to save your request. Please try again." }, { status: 500 });
  }

  // 6. Send admin email notification (non-blocking — form submit must not fail due to email)
  const notifyEmail = process.env.LEAD_NOTIFY_EMAIL;
  if (notifyEmail) {
    const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://qstechnology.vn"}/admin/leads/${newLead.id}`;
    sendEmail({
      to: notifyEmail,
      template: "lead-notification",
      subject: `[QS] Liên hệ mới · ${data.source} · ${data.name ?? data.email}`,
      props: {
        id: newLead.id,
        source: newLead.source,
        name: newLead.name ?? null,
        email: newLead.email,
        phone: newLead.phone ?? null,
        company: newLead.company ?? null,
        message: newLead.message ?? null,
        locale: newLead.locale,
        createdAt: newLead.createdAt,
        adminUrl,
      },
    }).catch((err) => {
      console.error("[api/leads] Email notification failed (lead still saved):", err);
    });
  }

  return NextResponse.json({ ok: true, id: newLead.id });
}
