import { getPool } from "@/lib/db";
import type { ProviderMemory } from "@/lib/provider-memory-types";

export { providerMemoryCategories } from "@/lib/provider-memory-types";
export type { ProviderMemory, ProviderMemoryCategory } from "@/lib/provider-memory-types";

const memoryLimit = 200;

function pool() {
  const value = getPool();
  if (!value) throw new Error("Provider AI memory requires PostgreSQL.");
  return value;
}

function mapMemory(row: Record<string, unknown>): ProviderMemory {
  return {
    id: String(row.id),
    category: String(row.category),
    content: String(row.content),
    source: String(row.source),
    pinned: Boolean(row.pinned),
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function listProviderMemories(providerId: string): Promise<ProviderMemory[]> {
  let result;
  try {
    result = await pool().query(
      `SELECT id, category, content, source, pinned, created_at, updated_at
       FROM provider_ai_memories
       WHERE provider_account_id = $1
       ORDER BY pinned DESC, updated_at DESC`,
      [providerId],
    );
  } catch (error) {
    if ((error as { code?: string }).code === "42P01") return [];
    throw error;
  }
  return result.rows.map(mapMemory);
}

export async function createProviderMemory(
  providerId: string,
  input: { category: string; content: string; pinned: boolean },
): Promise<ProviderMemory> {
  const count = await pool().query(
    "SELECT COUNT(*)::int AS total FROM provider_ai_memories WHERE provider_account_id = $1",
    [providerId],
  );
  if (Number(count.rows[0].total) >= memoryLimit) {
    throw new Error("Memory is full. Delete a memory you no longer need first.");
  }
  const result = await pool().query(
    `INSERT INTO provider_ai_memories (provider_account_id, category, content, pinned)
     VALUES ($1, $2, $3, $4)
     RETURNING id, category, content, source, pinned, created_at, updated_at`,
    [providerId, input.category, input.content, input.pinned],
  );
  return mapMemory(result.rows[0]);
}

export async function updateProviderMemory(
  providerId: string,
  memoryId: string,
  input: { category: string; content: string; pinned: boolean },
): Promise<ProviderMemory> {
  const result = await pool().query(
    `UPDATE provider_ai_memories
     SET category = $3, content = $4, pinned = $5, updated_at = NOW()
     WHERE id = $2 AND provider_account_id = $1
     RETURNING id, category, content, source, pinned, created_at, updated_at`,
    [providerId, memoryId, input.category, input.content, input.pinned],
  );
  if (!result.rowCount) throw new Error("Memory not found.");
  return mapMemory(result.rows[0]);
}

export async function deleteProviderMemory(providerId: string, memoryId: string) {
  const result = await pool().query(
    "DELETE FROM provider_ai_memories WHERE id = $2 AND provider_account_id = $1",
    [providerId, memoryId],
  );
  if (!result.rowCount) throw new Error("Memory not found.");
}

export async function clearProviderMemories(providerId: string): Promise<number> {
  try {
    const result = await pool().query(
      "DELETE FROM provider_ai_memories WHERE provider_account_id = $1",
      [providerId],
    );
    return result.rowCount ?? 0;
  } catch (error) {
    if ((error as { code?: string }).code === "42P01") return 0;
    throw error;
  }
}
