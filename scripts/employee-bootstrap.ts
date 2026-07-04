import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
const email = process.env.OWNER_EMAIL?.trim().toLowerCase();
const password = process.env.OWNER_PASSWORD;
const fullName = process.env.OWNER_NAME?.trim();

if (!connectionString || !email || !password || !fullName) {
  throw new Error("DATABASE_URL, OWNER_EMAIL, OWNER_PASSWORD, and OWNER_NAME are required.");
}
if (password.length < 12) throw new Error("OWNER_PASSWORD must be at least 12 characters.");

const pool = new Pool({ connectionString });
try {
  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query(
    `
      INSERT INTO employees (id, full_name, email, password_hash, role, status)
      VALUES ($1, $2, $3, $4, 'owner', 'active')
      ON CONFLICT (email) DO NOTHING
    `,
    [randomUUID(), fullName, email, passwordHash],
  );
  console.log("Owner bootstrap complete. Existing accounts were not changed.");
} finally {
  await pool.end();
}
