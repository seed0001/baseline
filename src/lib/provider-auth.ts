import { createHash, randomBytes, randomUUID } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { getPool } from "@/lib/db";
import type { ProviderApplicationStatus } from "@/lib/provider-applications";

const sessionCookie = "baseline_provider_session";
const sessionLifetimeMs = 30 * 24 * 60 * 60 * 1000;

export type CurrentProvider = {
  id: string;
  email: string;
  fullName: string;
  businessName: string;
  applicationId: string;
  applicationReference: string;
  applicationStatus: ProviderApplicationStatus;
  memberSince: Date;
};

function pool() {
  const value = getPool();
  if (!value) throw new Error("Provider authentication requires PostgreSQL.");
  return value;
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function authenticateProvider(email: string, password: string) {
  const result = await pool().query(
    "SELECT * FROM provider_accounts WHERE email = LOWER($1) LIMIT 1",
    [email],
  );
  const row = result.rows[0];
  const now = new Date();

  if (
    !row ||
    row.status !== "active" ||
    (row.locked_until && new Date(row.locked_until) > now) ||
    !(await bcrypt.compare(password, row.password_hash))
  ) {
    if (row?.status === "active") {
      const attempts = Number(row.failed_login_attempts) + 1;
      await pool().query(
        `
          UPDATE provider_accounts
          SET failed_login_attempts = $2,
              locked_until = CASE WHEN $2 >= 5 THEN NOW() + INTERVAL '15 minutes' ELSE locked_until END,
              updated_at = NOW()
          WHERE id = $1
        `,
        [row.id, attempts],
      );
    }
    return null;
  }

  await pool().query(
    `
      UPDATE provider_accounts
      SET failed_login_attempts = 0, locked_until = NULL, last_login_at = NOW(), updated_at = NOW()
      WHERE id = $1
    `,
    [row.id],
  );
  return { id: String(row.id) };
}

export async function createProviderSession(providerAccountId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + sessionLifetimeMs);
  await pool().query(
    `
      INSERT INTO provider_sessions (id, provider_account_id, token_hash, expires_at)
      VALUES ($1, $2, $3, $4)
    `,
    [randomUUID(), providerAccountId, hashToken(token), expiresAt],
  );
  (await cookies()).set(sessionCookie, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroyProviderSession() {
  const store = await cookies();
  const token = store.get(sessionCookie)?.value;
  if (token) {
    await pool().query("DELETE FROM provider_sessions WHERE token_hash = $1", [hashToken(token)]);
  }
  store.delete(sessionCookie);
}

export const getCurrentProvider = cache(async (): Promise<CurrentProvider | null> => {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return null;

  const result = await pool().query(
    `
      SELECT a.id, a.email, a.created_at,
             p.id AS application_id, p.reference, p.full_name, p.business_name,
             p.status AS application_status
      FROM provider_sessions s
      JOIN provider_accounts a ON a.id = s.provider_account_id
      JOIN provider_applications p ON p.id = a.application_id
      WHERE s.token_hash = $1
        AND s.expires_at > NOW()
        AND a.status = 'active'
      LIMIT 1
    `,
    [hashToken(token)],
  );
  if (!result.rowCount) return null;
  const row = result.rows[0];
  return {
    id: String(row.id),
    email: String(row.email),
    fullName: String(row.full_name),
    businessName: String(row.business_name),
    applicationId: String(row.application_id),
    applicationReference: String(row.reference),
    applicationStatus: row.application_status as ProviderApplicationStatus,
    memberSince: new Date(String(row.created_at)),
  };
});

export async function requireProvider() {
  const provider = await getCurrentProvider();
  if (!provider) redirect("/providers/login");
  return provider;
}
