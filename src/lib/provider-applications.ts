import { randomBytes, randomUUID } from "node:crypto";
import { getPool } from "@/lib/db";

export const providerApplicationStatuses = [
  "new",
  "under_review",
  "information_requested",
  "credentials",
  "background_check",
  "skill_review",
  "approved",
  "declined",
  "withdrawn",
] as const;

export type ProviderApplicationStatus = (typeof providerApplicationStatuses)[number];

export type ProviderApplicationInput = {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  primaryField: string;
  experienceRange: string;
  hasTradeLicense: boolean;
  hasLiabilityInsurance: boolean;
  consentsToBackgroundCheck: boolean;
  workDescription: string;
};

export type ProviderApplication = ProviderApplicationInput & {
  id: string;
  reference: string;
  status: ProviderApplicationStatus;
  submittedAt: Date;
  updatedAt: Date;
};

function requirePool() {
  const pool = getPool();
  if (!pool) throw new Error("Application storage is not configured.");
  return pool;
}

function mapApplication(row: Record<string, unknown>): ProviderApplication {
  return {
    id: String(row.id),
    reference: String(row.reference),
    fullName: String(row.full_name),
    businessName: String(row.business_name),
    email: String(row.email),
    phone: String(row.phone),
    primaryField: String(row.primary_field),
    experienceRange: String(row.experience_range),
    hasTradeLicense: Boolean(row.has_trade_license),
    hasLiabilityInsurance: Boolean(row.has_liability_insurance),
    consentsToBackgroundCheck: Boolean(row.consents_to_background_check),
    workDescription: String(row.work_description),
    status: row.status as ProviderApplicationStatus,
    submittedAt: new Date(String(row.submitted_at)),
    updatedAt: new Date(String(row.updated_at)),
  };
}

export async function createProviderApplication(input: ProviderApplicationInput) {
  const pool = requirePool();
  const client = await pool.connect();
  const id = randomUUID();
  const reference = `BPA-${new Date().getUTCFullYear()}-${randomBytes(3).toString("hex").toUpperCase()}`;

  try {
    await client.query("BEGIN");
    const inserted = await client.query(
      `
        INSERT INTO provider_applications (
          id, reference, full_name, business_name, email, phone, primary_field,
          experience_range, has_trade_license, has_liability_insurance,
          consents_to_background_check, work_description
        )
        VALUES ($1, $2, $3, $4, LOWER($5), $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `,
      [
        id,
        reference,
        input.fullName,
        input.businessName,
        input.email,
        input.phone,
        input.primaryField,
        input.experienceRange,
        input.hasTradeLicense,
        input.hasLiabilityInsurance,
        input.consentsToBackgroundCheck,
        input.workDescription,
      ],
    );
    await client.query(
      `
        INSERT INTO provider_application_events (
          application_id, event_type, to_status, actor
        )
        VALUES ($1, 'submitted', 'new', 'applicant')
      `,
      [id],
    );
    await client.query(
      `
        INSERT INTO operations_notifications (kind, subject_id, payload)
        VALUES ('provider_application_submitted', $1, $2::jsonb)
      `,
      [id, JSON.stringify({ reference, businessName: input.businessName, primaryField: input.primaryField })],
    );
    await client.query("COMMIT");
    return mapApplication(inserted.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getProviderApplication(id: string) {
  const result = await requirePool().query(
    "SELECT * FROM provider_applications WHERE id = $1 LIMIT 1",
    [id],
  );
  return result.rowCount ? mapApplication(result.rows[0]) : null;
}

export async function recordProviderApplicationEvent(
  applicationId: string,
  eventType: string,
  note: string,
  actor: string,
) {
  await requirePool().query(
    `
      INSERT INTO provider_application_events (application_id, event_type, note, actor)
      VALUES ($1, $2, $3, $4)
    `,
    [applicationId, eventType, note || null, actor],
  );
}

export async function listProviderApplications() {
  const result = await requirePool().query(
    "SELECT * FROM provider_applications ORDER BY submitted_at DESC",
  );
  return result.rows.map(mapApplication);
}

export async function updateProviderApplicationStatus(
  id: string,
  status: ProviderApplicationStatus,
  note: string,
  actor: string,
) {
  const pool = requirePool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const current = await client.query<{ status: ProviderApplicationStatus }>(
      "SELECT status FROM provider_applications WHERE id = $1 FOR UPDATE",
      [id],
    );
    if (current.rowCount !== 1) throw new Error("Application not found.");

    await client.query(
      "UPDATE provider_applications SET status = $2, updated_at = NOW() WHERE id = $1",
      [id, status],
    );
    await client.query(
      `
        INSERT INTO provider_application_events (
          application_id, event_type, from_status, to_status, note, actor
        )
        VALUES ($1, 'status_changed', $2, $3, $4, $5)
      `,
      [id, current.rows[0].status, status, note || null, actor],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
