import { randomUUID } from "node:crypto";
import { getPool } from "@/lib/db";

export type ProviderService = {
  id: string;
  name: string;
  description: string;
  scopeItems: string[];
  exclusions: string[];
  requiredInfo: string[];
  requiredPhotos: string[];
  priceAmount: number | null;
  priceType: "fixed" | "starting_at" | "estimate" | "hourly" | "custom";
  duration: string;
  benchmarkServiceId: string | null;
  status: "draft" | "published" | "archived";
  updatedAt: string;
};

export type ProviderTool = {
  id: string;
  name: string;
  toolType: string;
  description: string;
  status: "draft" | "active" | "archived";
};

export type ProviderActivity = {
  id: string;
  action: string;
  subject: string;
  detail: string;
  createdAt: string;
};

function pool() {
  const value = getPool();
  if (!value) throw new Error("The provider workspace requires PostgreSQL.");
  return value;
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function mapService(row: Record<string, unknown>): ProviderService {
  return {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description ?? ""),
    scopeItems: strings(row.scope_items),
    exclusions: strings(row.exclusions),
    requiredInfo: strings(row.required_info),
    requiredPhotos: strings(row.required_photos),
    priceAmount: row.price_amount == null ? null : Number(row.price_amount),
    priceType: row.price_type as ProviderService["priceType"],
    duration: String(row.duration ?? ""),
    benchmarkServiceId: row.benchmark_service_id ? String(row.benchmark_service_id) : null,
    status: row.status as ProviderService["status"],
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function listProviderServices(providerId: string) {
  const result = await pool().query(
    "SELECT * FROM provider_catalog_services WHERE provider_account_id = $1 AND status <> 'archived' ORDER BY updated_at DESC",
    [providerId],
  );
  return result.rows.map(mapService);
}

export async function listProviderTools(providerId: string): Promise<ProviderTool[]> {
  const result = await pool().query(
    "SELECT id, name, tool_type, description, status FROM provider_business_tools WHERE provider_account_id = $1 AND status <> 'archived' ORDER BY updated_at DESC",
    [providerId],
  );
  return result.rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    toolType: String(row.tool_type),
    description: String(row.description),
    status: row.status as ProviderTool["status"],
  }));
}

export async function listProviderActivity(providerId: string): Promise<ProviderActivity[]> {
  const result = await pool().query(
    "SELECT id, action, subject, detail, created_at FROM provider_activity WHERE provider_account_id = $1 ORDER BY created_at DESC LIMIT 30",
    [providerId],
  );
  return result.rows.map((row) => ({
    id: String(row.id),
    action: String(row.action),
    subject: String(row.subject),
    detail: String(row.detail),
    createdAt: new Date(String(row.created_at)).toISOString(),
  }));
}

export async function recordProviderActivity(
  providerId: string,
  action: string,
  subject: string,
  detail: string,
) {
  await pool().query(
    "INSERT INTO provider_activity (provider_account_id, action, subject, detail) VALUES ($1,$2,$3,$4)",
    [providerId, action, subject, detail],
  );
}

export async function saveProviderService(
  providerId: string,
  service: Omit<ProviderService, "id" | "updatedAt"> & { id?: string },
) {
  const id = service.id || randomUUID();
  const result = await pool().query(
    `INSERT INTO provider_catalog_services
      (id, provider_account_id, name, description, scope_items, exclusions, required_info,
       required_photos, price_amount, price_type, duration, benchmark_service_id, status)
     VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7::jsonb,$8::jsonb,$9,$10,$11,$12,$13)
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name, description = EXCLUDED.description, scope_items = EXCLUDED.scope_items,
       exclusions = EXCLUDED.exclusions, required_info = EXCLUDED.required_info,
       required_photos = EXCLUDED.required_photos, price_amount = EXCLUDED.price_amount,
       price_type = EXCLUDED.price_type, duration = EXCLUDED.duration,
       benchmark_service_id = EXCLUDED.benchmark_service_id, status = EXCLUDED.status,
       updated_at = NOW()
     WHERE provider_catalog_services.provider_account_id = $2
     RETURNING *`,
    [
      id, providerId, service.name, service.description, JSON.stringify(service.scopeItems),
      JSON.stringify(service.exclusions), JSON.stringify(service.requiredInfo),
      JSON.stringify(service.requiredPhotos), service.priceAmount, service.priceType,
      service.duration, service.benchmarkServiceId, service.status,
    ],
  );
  if (!result.rowCount) throw new Error("Service not found.");
  await recordProviderActivity(
    providerId,
    service.status === "published" ? "Published service" : "Saved draft",
    service.name,
    "Catalog updated",
  );
  return mapService(result.rows[0]);
}
