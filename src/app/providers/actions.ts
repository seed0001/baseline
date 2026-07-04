"use server";

import { z } from "zod";
import { createProviderApplication } from "@/lib/provider-applications";

export type ProviderApplicationFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  reference?: string;
  errors?: Record<string, string[]>;
};

const applicationSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(120),
  businessName: z.string().trim().min(2, "Enter your business name.").max(160),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  phone: z.string().trim().min(7, "Enter a valid phone number.").max(40),
  primaryField: z.string().trim().min(1, "Select your primary field.").max(100),
  experienceRange: z.string().trim().min(1).max(40),
  hasTradeLicense: z.boolean(),
  hasLiabilityInsurance: z.boolean(),
  consentsToBackgroundCheck: z.literal(true, {
    error: "Consent is required to continue the provider screening process.",
  }),
  workDescription: z.string().trim().min(30, "Tell us a little more about your work.").max(3000),
  website: z.string().max(0),
});

export async function submitProviderApplication(
  _previous: ProviderApplicationFormState,
  formData: FormData,
): Promise<ProviderApplicationFormState> {
  const parsed = applicationSchema.safeParse({
    fullName: formData.get("fullName"),
    businessName: formData.get("businessName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    primaryField: formData.get("primaryField"),
    experienceRange: formData.get("experienceRange"),
    hasTradeLicense: formData.get("hasTradeLicense") === "on",
    hasLiabilityInsurance: formData.get("hasLiabilityInsurance") === "on",
    consentsToBackgroundCheck: formData.get("consentsToBackgroundCheck") === "on",
    workDescription: formData.get("workDescription"),
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted information.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const applicationInput = {
    fullName: parsed.data.fullName,
    businessName: parsed.data.businessName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    primaryField: parsed.data.primaryField,
    experienceRange: parsed.data.experienceRange,
    hasTradeLicense: parsed.data.hasTradeLicense,
    hasLiabilityInsurance: parsed.data.hasLiabilityInsurance,
    consentsToBackgroundCheck: parsed.data.consentsToBackgroundCheck,
    workDescription: parsed.data.workDescription,
  };

  try {
    const application = await createProviderApplication(applicationInput);
    return {
      status: "success",
      message: "Your application is in the Baseline review queue.",
      reference: application.reference,
    };
  } catch {
    return {
      status: "error",
      message: "We couldn’t save your application. Please try again shortly.",
    };
  }
}
