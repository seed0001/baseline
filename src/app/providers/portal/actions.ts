"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { destroyProviderSession, requireProvider } from "@/lib/provider-auth";
import {
  requestServiceQualification,
  withdrawServiceQualification,
} from "@/lib/provider-accounts";
import { getCatalogServices } from "@/lib/catalog";

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
