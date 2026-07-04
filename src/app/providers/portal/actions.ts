"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { destroyProviderSession, requireProvider } from "@/lib/provider-auth";
import {
  listProviderQualifications,
  requestServiceQualification,
  withdrawServiceQualification,
} from "@/lib/provider-accounts";
import { getCatalogServices } from "@/lib/catalog";
import { askAssistant } from "@/lib/ai";

const serviceSchema = z.object({ serviceId: z.string().trim().min(1).max(60) });

async function parseServiceId(formData: FormData) {
  const parsed = serviceSchema.safeParse({ serviceId: formData.get("serviceId") });
  if (!parsed.success) throw new Error("Invalid service.");
  const services = await getCatalogServices();
  if (!services.some((s) => s.id === parsed.data.serviceId)) {
    throw new Error("Unknown catalog service.");
  }
  return parsed.data.serviceId;
}

export async function requestQualification(formData: FormData) {
  const provider = await requireProvider();
  const serviceId = await parseServiceId(formData);
  await requestServiceQualification(provider.id, serviceId);
  revalidatePath("/providers/portal");
}

export async function withdrawQualification(formData: FormData) {
  const provider = await requireProvider();
  const serviceId = await parseServiceId(formData);
  await withdrawServiceQualification(provider.id, serviceId);
  revalidatePath("/providers/portal");
}

export async function signOutProvider() {
  await destroyProviderSession();
  redirect("/providers/login");
}

const messageSchema = z.string().trim().min(1).max(4000);

export async function sendProviderMessage(message: string): Promise<string> {
  const provider = await requireProvider();
  const parsed = messageSchema.safeParse(message);
  if (!parsed.success) throw new Error("Enter a message.");

  const [services, qualifications] = await Promise.all([
    getCatalogServices(),
    listProviderQualifications(provider.id),
  ]);
  const serviceNames = new Map(services.map((s) => [s.id, s.name]));
  const qualificationSummary =
    qualifications.length > 0
      ? qualifications
          .map((q) => `${serviceNames.get(q.serviceId) ?? q.serviceId}: ${q.status}`)
          .join("; ")
      : "none yet";

  try {
    return await askAssistant({
      audience: "provider",
      subjectId: provider.id,
      message: parsed.data,
      context: `Provider: ${provider.fullName}, business ${provider.businessName}, application ${provider.applicationReference}, screening status ${provider.applicationStatus}. Service qualifications: ${qualificationSummary}.`,
    });
  } catch (error) {
    return error instanceof Error
      ? `⚠ ${error.message}`
      : "⚠ The assistant hit an error — please try again.";
  }
}
