"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireProvider } from "@/lib/provider-auth";
import { saveProviderService, type ProviderService } from "@/lib/provider-workspace";
import { askAssistant } from "@/lib/ai";
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
