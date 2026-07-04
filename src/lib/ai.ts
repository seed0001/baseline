import { randomUUID } from "node:crypto";
import { getPool } from "@/lib/db";

export type AiAudience = "staff" | "provider" | "customer";

export type ChatMessage = { role: "user" | "assistant"; content: string };

const personas: Record<AiAudience, string> = {
  staff: [
    "You are the Baseline Operations Assistant, helping Baseline staff run the platform.",
    "You help with: reviewing provider qualification requests against the structured checklist",
    "(credentials/licensing, insurance, experience evidence, screening status, open concerns),",
    "drafting decision notes, explaining screening stages and roles, and summarizing operational workload.",
    "Baseline owns its service catalog with evidence-backed baseline prices; providers apply, pass",
    "screening, and qualify per service. Be direct, concise, and practical. When advising on a",
    "qualification decision, walk through each checklist item and recommend qualify or decline",
    "with reasoning — but remind staff the final decision and verification of documents is theirs.",
  ].join(" "),
  provider: [
    "You are the Baseline Provider Assistant, helping screened service providers succeed on Baseline.",
    "You help with: understanding screening stages (application review, credentials & insurance,",
    "background check, skill qualification), requesting service qualifications from the catalog,",
    "how job invitations work (scope, photos, and payout are fixed before you accept, no bidding),",
    "and payouts (funds are escrowed before a phase starts and paid within 2 business days of",
    "customer approval). Providers cannot create or edit catalog listings — Baseline owns the catalog.",
    "Be encouraging, clear, and honest about what is still pending review.",
  ].join(" "),
  customer: [
    "You are the Baseline Assistant, helping customers get work done at a fair price.",
    "Baseline is a managed service catalog: every service has a baseline average price compiled",
    "from independent published market data (see /methodology), adjusted for the customer's region.",
    "Help customers find the right catalog service, understand the price evidence and quote ranges,",
    "and explain how projects work: quote request, then a firm phase-based proposal, then milestones",
    "where payment is escrowed per phase and released only when the customer approves the work.",
    "If they need something not in the catalog, point them to /custom-request.",
    "Never invent prices — refer to the catalog figures provided in context. Be warm and plain-spoken.",
  ].join(" "),
};

function pool() {
  const value = getPool();
  if (!value) throw new Error("The assistant requires PostgreSQL.");
  return value;
}

export async function getConversationHistory(
  audience: AiAudience,
  subjectId: string,
  limit = 30,
): Promise<ChatMessage[]> {
  const result = await pool().query(
    `
      SELECT m.role, m.content
      FROM ai_messages m
      JOIN ai_conversations c ON c.id = m.conversation_id
      WHERE c.audience = $1 AND c.subject_id = $2
      ORDER BY m.id DESC
      LIMIT $3
    `,
    [audience, subjectId, limit],
  );
  return result.rows
    .reverse()
    .map((row) => ({ role: row.role as ChatMessage["role"], content: String(row.content) }));
}

async function ensureConversation(audience: AiAudience, subjectId: string) {
  const existing = await pool().query(
    "SELECT id FROM ai_conversations WHERE audience = $1 AND subject_id = $2",
    [audience, subjectId],
  );
  if (existing.rowCount) return String(existing.rows[0].id);
  const id = randomUUID();
  await pool().query(
    "INSERT INTO ai_conversations (id, audience, subject_id) VALUES ($1, $2, $3)",
    [id, audience, subjectId],
  );
  return id;
}

async function callOpenRouter(messages: { role: string; content: string }[]) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "The assistant is not configured yet — OPENROUTER_API_KEY is missing.",
    );
  }
  const model = process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-haiku";

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages, max_tokens: 800 }),
  });
  if (!response.ok) {
    throw new Error(`Assistant request failed (${response.status}).`);
  }
  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("The assistant returned an empty reply.");
  return content;
}

/**
 * Sends a message to the persona assistant for the given audience, with
 * persistent per-subject memory. Each audience has its own persona and its
 * own conversation store: staff memory is keyed to the employee, provider
 * memory to the provider account, customer memory to an anonymous visitor id.
 */
export async function askAssistant(input: {
  audience: AiAudience;
  subjectId: string;
  message: string;
  context?: string;
}): Promise<string> {
  const conversationId = await ensureConversation(input.audience, input.subjectId);
  const history = await getConversationHistory(input.audience, input.subjectId);

  const system = input.context
    ? `${personas[input.audience]}\n\nCurrent context:\n${input.context}`
    : personas[input.audience];

  const reply = await callOpenRouter([
    { role: "system", content: system },
    ...history,
    { role: "user", content: input.message },
  ]);

  await pool().query(
    `
      INSERT INTO ai_messages (conversation_id, role, content)
      VALUES ($1, 'user', $2), ($1, 'assistant', $3)
    `,
    [conversationId, input.message, reply],
  );
  await pool().query("UPDATE ai_conversations SET updated_at = NOW() WHERE id = $1", [
    conversationId,
  ]);
  return reply;
}
