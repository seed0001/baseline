import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required.");

const pool = new Pool({ connectionString });

try {
  const migrationsDirectory = path.join(process.cwd(), "db", "migrations");
  const migrations = (await readdir(migrationsDirectory))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const migration of migrations) {
    const sql = await readFile(path.join(migrationsDirectory, migration), "utf8");
    await pool.query(sql);
    console.log(`Applied ${migration}.`);
  }
} finally {
  await pool.end();
}
