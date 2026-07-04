import { Pool } from "pg";

const globalForDb = globalThis as unknown as { baselinePool?: Pool };

export function getPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    if (process.env.REQUIRE_DATABASE === "true") {
      throw new Error("DATABASE_URL is required but is not configured.");
    }
    return null;
  }

  globalForDb.baselinePool ??= new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  return globalForDb.baselinePool;
}
