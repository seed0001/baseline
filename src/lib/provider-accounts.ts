import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { getPool } from "@/lib/db";
import {
  getProviderApplication,
  recordProviderApplicationEvent,
} from "@/lib/provider-applications";

export type QualificationStatus = "requested" | "qualified" | "declined" | "withdrawn";

export type ProviderQualification = {
  serviceId: string;
  status: QualificationStatus;
  requestedAt: Date;
};

function pool() {
  const value = getPool();
  if (!value) throw new Error("Provider accounts require PostgreSQL.");
  return value;
}

export async function createProviderAccount(input: {
  applicationId: string;
  password: string;
  actor: string;
}) {
  const application = await getProviderApplication(input.applicationId);
  if (!application) throw new Error("Application not found.");

  await pool().query(
    `
      INSERT INTO provider_accounts (id, application_id, email, password_hash)
      VALUES ($1, $2, LOWER($3), $4)
    `,
    [randomUUID(), application.id, application.email, await bcrypt.hash(input.password, 12)],
  );
  await recordProviderApplicationEvent(
    application.id,
    "portal_account_created",
    "Provider portal account created",
    input.actor,
  );
  return { email: application.email.toLowerCase() };
}

export async function resetProviderAccountPassword(input: {
  applicationId: string;
  password: string;
  actor: string;
}) {
  const client = await pool().connect();
  try {
    await client.query("BEGIN");
    const updated = await client.query(
      `
        UPDATE provider_accounts
        SET password_hash = $2, failed_login_attempts = 0, locked_until = NULL, updated_at = NOW()
        WHERE application_id = $1
        RETURNING id, email
      `,
      [input.applicationId, await bcrypt.hash(input.password, 12)],
    );
    if (!updated.rowCount) throw new Error("Provider account not found.");
    await client.query(
      "DELETE FROM provider_sessions WHERE provider_account_id = $1",
      [updated.rows[0].id],
    );
    await client.query(
      `
        INSERT INTO provider_application_events (application_id, event_type, note, actor)
        VALUES ($1, 'portal_password_reset', 'Provider portal password reset', $2)
      `,
      [input.applicationId, input.actor],
    );
    await client.query("COMMIT");
    return { email: String(updated.rows[0].email) };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listProviderAccountApplicationIds(): Promise<Set<string>> {
  const result = await pool().query("SELECT application_id FROM provider_accounts");
  return new Set(result.rows.map((row) => String(row.application_id)));
}

export async function listProviderQualifications(
  providerAccountId: string,
): Promise<ProviderQualification[]> {
  const result = await pool().query(
    `
      SELECT service_id, status, requested_at
      FROM provider_service_qualifications
      WHERE provider_account_id = $1
    `,
    [providerAccountId],
  );
  return result.rows.map((row) => ({
    serviceId: String(row.service_id),
    status: row.status as QualificationStatus,
    requestedAt: new Date(String(row.requested_at)),
  }));
}

export async function requestServiceQualification(providerAccountId: string, serviceId: string) {
  await pool().query(
    `
      INSERT INTO provider_service_qualifications (provider_account_id, service_id, status)
      VALUES ($1, $2, 'requested')
      ON CONFLICT (provider_account_id, service_id)
      DO UPDATE SET status = 'requested', requested_at = NOW(), decided_at = NULL, decided_by = NULL
      WHERE provider_service_qualifications.status IN ('withdrawn', 'declined')
    `,
    [providerAccountId, serviceId],
  );
}

export async function withdrawServiceQualification(providerAccountId: string, serviceId: string) {
  await pool().query(
    `
      UPDATE provider_service_qualifications
      SET status = 'withdrawn'
      WHERE provider_account_id = $1 AND service_id = $2 AND status = 'requested'
    `,
    [providerAccountId, serviceId],
  );
}
