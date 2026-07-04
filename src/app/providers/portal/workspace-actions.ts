"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireProvider } from "@/lib/provider-auth";
import {
  recordProviderActivity,
  saveProviderService,
  type ProviderService,
} from "@/lib/provider-workspace";
import { askAssistant, clearConversation } from "@/lib/ai";
import { getCatalogServices } from "@/lib/catalog";
import {
  getProviderMemoryContext,
  listProviderPersonas,
  personaSubjectId,
  personaSystemInstructions,
  providerPersonaDefaults,
  saveProviderPersona,
  type ProviderPersonaKey,
} from "@/lib/provider-personas";
import {
  clearProviderMemories,
  createProviderMemory,
  deleteProviderMemory,
  providerMemoryCategories,
  updateProviderMemory,
  type ProviderMemory,
} from "@/lib/provider-memory";

const serviceSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1200),
  scopeItems: z.array(z.string().trim().min(1).max(200)).max(20),
  exclusions: z.array(z.string().trim().min(1).max(200)).max(20),
  requiredInfo: z.array(z.string().trim().min(1).max(200)).max(20),
  requiredPhotos: z.array(z.string().trim().min(1).max(200)).max(20),
  priceAmount: z.number().nonnegative().max(10_000_000).nullable(),
  priceType: z.enum(["fixed", "starting_at", "estimate", "hourly", "custom"]),
  duration: z.string().trim().max(120),
  benchmarkServiceId: z.string().max(60).nullable(),
  status: z.enum(["draft", "published", "archived"]),
});

export async function saveCatalogService(input: unknown): Promise<ProviderService> {
  const provider = await requireProvider();
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) throw new Error("Review the service details and try again.");
  const service = await saveProviderService(provider.id, parsed.data);
  revalidatePath("/providers/portal");
  return service;
}

const generatedDraftSchema = serviceSchema.omit({
  id: true,
  benchmarkServiceId: true,
  status: true,
});

export async function generateCatalogDraft(prompt: string) {
  const provider = await requireProvider();
  const request = z.string().trim().min(5).max(4000).parse(prompt);
  const reply = await askAssistant({
    audience: "provider",
    subjectId: provider.id,
    message: [
      "Create a structured service-catalog draft from my request below.",
      "Return JSON only, with these exact fields:",
      "name, description, scopeItems, exclusions, requiredInfo, requiredPhotos,",
      "priceAmount (number or null), priceType (fixed, starting_at, estimate, hourly, or custom), duration.",
      "Use short, customer-facing language. Do not invent a price I did not provide.",
      `Request: ${request}`,
    ].join("\n"),
    context: `Provider business: ${provider.businessName}. The provider is building a service listing that they will review before publishing.`,
  });
  const json = reply.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const parsed = generatedDraftSchema.safeParse(JSON.parse(json));
  if (!parsed.success) throw new Error("The AI draft was incomplete. Add more detail and try again.");
  return { ...parsed.data, benchmarkServiceId: null, status: "draft" as const };
}

const personaKeySchema = z.enum(["manager", "finance", "marketing", "analyst"]);

export type PersonaReply =
  | { ok: true; reply: string }
  | { ok: false; error: string };

export async function sendPersonaMessage(
  personaKey: ProviderPersonaKey,
  message: string,
): Promise<PersonaReply> {
  try {
    const provider = await requireProvider();
    const key = personaKeySchema.parse(personaKey);
    const request = z.string().trim().min(1).max(4000).parse(message);
    const [personas, services, memory] = await Promise.all([
      listProviderPersonas(provider.id),
      getCatalogServices(),
      getProviderMemoryContext(provider.id),
    ]);
    const persona = personas.find((item) => item.key === key) ?? providerPersonaDefaults[key];
    const providerServices = services.slice(0, 80).map((service) => service.name).join(", ");
    const reply = await askAssistant({
      audience: "provider",
      subjectId: personaSubjectId(provider.id, key),
      message: request,
      persona: personaSystemInstructions(persona),
      context: [
        `Business: ${provider.businessName}.`,
        `Baseline reference catalog: ${providerServices}.`,
        `Approved long-term memory:\n${memory}`,
      ].join("\n"),
    });
    return { ok: true, reply };
  } catch (error) {
    console.error("Provider persona message failed", error);
    return {
      ok: false,
      error: error instanceof Error && error.message.includes("OPENROUTER_API_KEY")
        ? "The AI connection is not configured in Vercel yet."
        : "The assistant could not respond. Please try again.",
    };
  }
}

const personaSettingsSchema = z.object({
  key: personaKeySchema,
  displayName: z.string().trim().min(2).max(60),
  communicationStyle: z.string().trim().min(2).max(300),
  customInstructions: z.string().trim().max(1200),
});

export async function updatePersonaSettings(input: unknown) {
  try {
    const provider = await requireProvider();
    const parsed = personaSettingsSchema.parse(input);
    await saveProviderPersona(provider.id, parsed);
    revalidatePath("/providers/portal");
    return { ok: true as const };
  } catch (error) {
    console.error("Provider persona settings failed", error);
    return { ok: false as const, error: "The persona settings could not be saved." };
  }
}

export type WorkspaceActionResult = { ok: true } | { ok: false; error: string };

export async function clearPersonaChat(
  personaKey: ProviderPersonaKey,
): Promise<WorkspaceActionResult> {
  const provider = await requireProvider();
  try {
    const key = personaKeySchema.parse(personaKey);
    const personas = await listProviderPersonas(provider.id);
    const persona = personas.find((item) => item.key === key) ?? providerPersonaDefaults[key];
    await clearConversation("provider", personaSubjectId(provider.id, key));
    await recordProviderActivity(
      provider.id,
      "Cleared AI conversation",
      persona.displayName,
      "Chat history deleted at your request",
    );
    revalidatePath("/providers/portal");
    return { ok: true };
  } catch (error) {
    console.error("Provider chat clear failed", error);
    return { ok: false, error: "The conversation could not be cleared. Please try again." };
  }
}

const memorySchema = z.object({
  id: z.string().regex(/^\d+$/).optional(),
  category: z.enum(providerMemoryCategories),
  content: z.string().trim().min(2).max(600),
  pinned: z.boolean(),
});

export type MemorySaveResult =
  | { ok: true; memory: ProviderMemory }
  | { ok: false; error: string };

export async function saveMemory(input: unknown): Promise<MemorySaveResult> {
  const provider = await requireProvider();
  let parsed;
  try {
    parsed = memorySchema.parse(input);
  } catch {
    return { ok: false, error: "Review the memory details and try again." };
  }
  try {
    const memory = parsed.id
      ? await updateProviderMemory(provider.id, parsed.id, parsed)
      : await createProviderMemory(provider.id, parsed);
    await recordProviderActivity(
      provider.id,
      parsed.id ? "Updated AI memory" : "Added AI memory",
      parsed.category,
      parsed.content.length > 80 ? `${parsed.content.slice(0, 80)}…` : parsed.content,
    );
    revalidatePath("/providers/portal");
    return { ok: true, memory };
  } catch (error) {
    console.error("Provider memory save failed", error);
    return {
      ok: false,
      error: error instanceof Error && error.message.includes("Memory is full")
        ? error.message
        : "The memory could not be saved. Please try again.",
    };
  }
}

export async function removeMemory(memoryId: string): Promise<WorkspaceActionResult> {
  const provider = await requireProvider();
  try {
    const id = z.string().regex(/^\d+$/).parse(memoryId);
    await deleteProviderMemory(provider.id, id);
    await recordProviderActivity(
      provider.id,
      "Deleted AI memory",
      "Long-term memory",
      "One memory removed at your request",
    );
    revalidatePath("/providers/portal");
    return { ok: true };
  } catch (error) {
    console.error("Provider memory delete failed", error);
    return { ok: false, error: "The memory could not be deleted. Please try again." };
  }
}

export async function removeAllMemories(): Promise<WorkspaceActionResult> {
  const provider = await requireProvider();
  try {
    const removed = await clearProviderMemories(provider.id);
    await recordProviderActivity(
      provider.id,
      "Cleared AI memory",
      "Long-term memory",
      `${removed} memories removed at your request`,
    );
    revalidatePath("/providers/portal");
    return { ok: true };
  } catch (error) {
    console.error("Provider memory clear failed", error);
    return { ok: false, error: "The memories could not be deleted. Please try again." };
  }
}
