import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { eq } from "drizzle-orm";

async function main() {
  const { auth } = await import("../lib/auth/server");
  const { db } = await import("../lib/db/client");
  const { user, account } = await import("../lib/db/schema/auth");

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("Missing ADMIN_EMAIL or ADMIN_PASSWORD env vars.");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  const [existing] = await db.select().from(user).where(eq(user.email, email)).limit(1);

  if (existing) {
    // Idempotent: rotate password by deleting credentials account row, then signing back up under a new internal id will fail.
    // Instead use Better Auth's setPassword via the credentials adapter: re-run signUp will conflict, so we use direct update.
    const ctx = await auth.$context;
    const hashed = await ctx.password.hash(password);
    await db
      .update(account)
      .set({ password: hashed, updatedAt: new Date() })
      .where(eq(account.userId, existing.id));
    await db
      .update(user)
      .set({ role: "admin", emailVerified: true, updatedAt: new Date() })
      .where(eq(user.id, existing.id));
    console.log(`Updated existing admin: ${email}`);
  } else {
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: "Admin",
      },
    });
    if (!result.user) {
      console.error("Sign-up returned no user.");
      process.exit(1);
    }
    await db
      .update(user)
      .set({ role: "admin", emailVerified: true })
      .where(eq(user.id, result.user.id));
    console.log(`Created admin: ${email}`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
