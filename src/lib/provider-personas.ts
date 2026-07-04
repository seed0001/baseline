import { getPool } from "@/lib/db";
import type { ChatMessage } from "@/lib/ai";
import { getConversationHistory } from "@/lib/ai";

export type ProviderPersonaKey = "manager" | "finance" | "marketing" | "analyst";

export type ProviderPersona = {
  key: ProviderPersonaKey;
  displayName: string;
  title: string;
  description: string;
  communicationStyle: string;
  customInstructions: string;
  color: string;
};

export const providerPersonaDefaults: Record<ProviderPersonaKey, ProviderPersona> = {
  manager: {
    key: "manager",
    displayName: "Business Manager",
    title: "Business Manager",
    description: "Priorities, projects, planning, reminders, and day-to-day direction.",
    communicationStyle: "Direct, practical, organized, and encouraging.",
    customInstructions: "",
    color: "teal",
  },
  finance: {
    key: "finance",
    displayName: "Financial Specialist",
    title: "Financial Specialist",
    description: "Pricing, cash flow, expenses, invoices, budgets, and profitability.",
    communicationStyle: "Careful, numbers-first, plain-spoken, and transparent about uncertainty.",
    customInstructions: "",
    color: "emerald",
  },
  marketing: {
    key: "marketing",
    displayName: "Marketing Specialist",
    title: "Marketing & Advertising",
    description: "Campaigns, promotions, customer segments, content, and advertising ideas.",
    communicationStyle: "Creative, specific, audience-aware, and focused on measurable outcomes.",
    customInstructions: "",
    color: "violet",
  },
  analyst: {
    key: "analyst",
    displayName: "Business Analyst",
    title: "Business Analyst",
    description: "Performance, trends, capacity, opportunities, and practical improvements.",
    communicationStyle: "Analytical, candid, curious, and evidence-led.",
    customInstructions: "",
    color: "amber",
  },
};

function pool() {
  const value = getPool();
  if (!value) throw new Error("Provider personas require PostgreSQL.");
  return value;
}

export function personaSubjectId(providerId: string, key: ProviderPersonaKey) {
  return key === "manager" ? providerId : `${providerId}:persona:${key}`;
}

export async function listProviderPersonas(providerId: string): Promise<ProviderPersona[]> {
  let result;
  try {
    result = await pool().query(
      "SELECT persona_key, display_name, communication_style, custom_instructions FROM provider_ai_personas WHERE provider_account_id = $1",
      [providerId],
    );
  } catch (error) {
    if ((error as { code?: string }).code === "42P01") {
      return Object.values(providerPersonaDefaults);
    }
    throw error;
  }
  const overrides = new Map(result.rows.map((row) => [String(row.persona_key), row]));
  return (Object.keys(providerPersonaDefaults) as ProviderPersonaKey[]).map((key) => {
    const base = providerPersonaDefaults[key];
    const row = overrides.get(key);
    return row
      ? {
          ...base,
          displayName: String(row.display_name),
          communicationStyle: String(row.communication_style),
          customInstructions: String(row.custom_instructions),
        }
      : base;
  });
}

export async function saveProviderPersona(
  providerId: string,
  input: Pick<ProviderPersona, "key" | "displayName" | "communicationStyle" | "customInstructions">,
) {
  await pool().query(
    `INSERT INTO provider_ai_personas
       (provider_account_id, persona_key, display_name, communication_style, custom_instructions)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (provider_account_id, persona_key) DO UPDATE SET
       display_name = EXCLUDED.display_name,
       communication_style = EXCLUDED.communication_style,
       custom_instructions = EXCLUDED.custom_instructions,
       updated_at = NOW()`,
    [providerId, input.key, input.displayName, input.communicationStyle, input.customInstructions],
  );
}

export async function getPersonaHistories(providerId: string) {
  const entries = await Promise.all(
    (Object.keys(providerPersonaDefaults) as ProviderPersonaKey[]).map(async (key) => {
      try {
        return [key, await getConversationHistory("provider", personaSubjectId(providerId, key), 30)] as const;
      } catch {
        return [key, [] as ChatMessage[]] as const;
      }
    }),
  );
  return Object.fromEntries(entries) as Record<ProviderPersonaKey, ChatMessage[]>;
}

export async function getProviderMemoryContext(providerId: string) {
  let result;
  try {
    result = await pool().query(
      `SELECT category, content FROM provider_ai_memories
       WHERE provider_account_id = $1 ORDER BY pinned DESC, updated_at DESC LIMIT 30`,
      [providerId],
    );
  } catch (error) {
    if ((error as { code?: string }).code === "42P01") {
      return "No provider-approved long-term memories have been saved yet.";
    }
    throw error;
  }
  return result.rows.length
    ? result.rows.map((row) => `[${row.category}] ${row.content}`).join("\n")
    : "No provider-approved long-term memories have been saved yet.";
}

export function personaSystemInstructions(persona: ProviderPersona) {
  const responsibilities: Record<ProviderPersonaKey, string> = {
    manager: "Act as the provider's chief of staff. Help prioritize work, organize projects, identify next actions, and keep the business on track.",
    finance: "Help with pricing, cash flow, expenses, invoices, budgets, and profitability. Clearly distinguish analysis from licensed accounting, tax, legal, or investment advice.",
    marketing: "Help create practical marketing and advertising plans, campaigns, promotions, customer segments, and content. Connect recommendations to measurable business outcomes.",
    analyst: "Analyze services, customers, workload, pricing, capacity, and performance. Identify patterns, challenge weak assumptions, and recommend practical improvements.",
  };
  return [
    `You are ${persona.displayName}, the provider's ${persona.title}.`,
    responsibilities[persona.key],
    `Communication style: ${persona.communicationStyle}`,
    persona.customInstructions ? `Provider instructions: ${persona.customInstructions}` : "",
    "You share the provider's approved business context with the other specialists, but this conversation is your own thread.",
    "Do not claim an action, reminder, calendar event, message, publication, or payment has been completed unless the application confirms it.",
  ].filter(Boolean).join(" ");
}
