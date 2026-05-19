import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

// Better Auth needs transactions + untagged template support, so use the
// WebSocket Pool driver (neon-http lacks transactions). In Node runtimes
// the WS implementation must be injected manually.
if (!neonConfig.webSocketConstructor) {
  neonConfig.webSocketConstructor = ws;
}

const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL!,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle({ client: pool, schema });
export type Db = typeof db;
