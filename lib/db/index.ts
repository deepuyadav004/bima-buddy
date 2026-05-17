import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// In dev mode, Next.js HMR re-imports modules — without a global singleton
// we'd create a fresh postgres client on every reload, leaking connections.
// Cache the client on globalThis to survive HMR reloads.
const globalForPostgres = globalThis as unknown as {
  __pg?: ReturnType<typeof postgres>;
};

const client =
  globalForPostgres.__pg ??
  postgres(connectionString, {
    ssl: "require",
    max: 5, // small pool, plenty for V0 (low concurrency)
    idle_timeout: 60, // seconds before idle connection is closed
    connect_timeout: 10, // fail fast if Azure firewall blocks us
    max_lifetime: 60 * 30, // recycle connections every 30 min (avoids stale-pool issues)
  });

if (process.env.NODE_ENV !== "production") {
  globalForPostgres.__pg = client;
}

export const db = drizzle(client, { schema });
export { schema };
