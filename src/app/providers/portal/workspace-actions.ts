"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireProvider } from "@/lib/provider-auth";
import { saveProviderService, type ProviderService } from "@/lib/provider-workspace";
import { askAssistant } from "@/lib/ai";

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
