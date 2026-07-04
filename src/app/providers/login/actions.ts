"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { authenticateProvider, createProviderSession } from "@/lib/provider-auth";

export type ProviderLoginState = { message?: string };

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(200),
});

export async function loginProvider(
  _previous: ProviderLoginState,
  formData: FormData,
): Promise<ProviderLoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { message: "Enter a valid email address and password." };

  const provider = await authenticateProvider(parsed.data.email, parsed.data.password);
  if (!provider) {
    return { message: "The email or password is incorrect, or this account is unavailable." };
  }

  await createProviderSession(provider.id);
  redirect("/providers/portal");
}
