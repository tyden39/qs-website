// One-shot helper: wipes the database to a clean slate so the next
// drizzle-kit generate can produce a single fresh migration. Used once
// during initial schema-freeze when the scaffolded columns diverge from
// the real schema and interactive rename prompts can't run in CI/agents.
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const sql = `
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
END $$;
`;

async function main() {
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log("All public tables dropped.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
