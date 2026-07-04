"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireEmployee } from "@/lib/employee-auth";
import { createEmployee } from "@/lib/employees";
import { employeeRoles, roleLabels } from "@/lib/permissions";
import {
  createProviderAccount,
  resetProviderAccountPassword,
} from "@/lib/provider-accounts";
import {
  getProviderApplication,
  providerApplicationStatuses,
  recordProviderApplicationEvent,
  updateProviderApplicationStatus,
} from "@/lib/provider-applications";

const updateSchema = z.object({
  applicationId: z.string().uuid(),
  status: z.enum(providerApplicationStatuses),
  note: z.string().trim().max(2000),
});

export async function updateApplicantStatus(formData: FormData) {
  const employee = await requireEmployee("applicants.manage");
  const parsed = updateSchema.safeParse({
    applicationId: formData.get("applicationId"),
    status: formData.get("status"),
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) throw new Error("Invalid application update.");

  await updateProviderApplicationStatus(
    parsed.data.applicationId,
    parsed.data.status,
    parsed.data.note,
    `${employee.fullName} (${employee.id})`,
  );
  revalidatePath("/admin/applicants");
}

const promoteSchema = z.object({
  applicationId: z.string().uuid(),
  role: z.enum(employeeRoles),
  team: z.string().trim().max(100),
});

export type PromoteApplicantState =
  | { status: "success"; email: string; tempPassword: string; roleLabel: string }
  | { status: "error"; message: string }
  | null;

export async function promoteApplicantToStaff(
  _prevState: PromoteApplicantState,
  formData: FormData,
): Promise<PromoteApplicantState> {
  const actor = await requireEmployee("employees.manage");
  const parsed = promoteSchema.safeParse({
    applicationId: formData.get("applicationId"),
    role: formData.get("role"),
    team: formData.get("team") ?? "",
  });
  if (!parsed.success) return { status: "error", message: "Invalid staff promotion details." };
  if (parsed.data.role === "owner" && actor.role !== "owner") {
    return { status: "error", message: "Only an owner can create another owner." };
  }

  const application = await getProviderApplication(parsed.data.applicationId);
  if (!application) return { status: "error", message: "Application not found." };

  const tempPassword = randomBytes(12).toString("base64url");
  try {
    await createEmployee({
      fullName: application.fullName,
      email: application.email,
      password: tempPassword,
      role: parsed.data.role,
      team: parsed.data.team,
      actorId: actor.id,
    });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "23505") {
      return { status: "error", message: "A staff account with this email already exists." };
    }
    throw error;
  }

  await recordProviderApplicationEvent(
    application.id,
    "staff_promoted",
    `Granted staff access as ${roleLabels[parsed.data.role]}`,
    `${actor.fullName} (${actor.id})`,
  );
  revalidatePath("/admin/applicants");
  revalidatePath("/admin/employees");
  return {
    status: "success",
    email: application.email,
    tempPassword,
    roleLabel: roleLabels[parsed.data.role],
  };
}

export type ProviderAccountState =
  | { status: "success"; email: string; tempPassword: string; action: "created" | "reset" }
  | { status: "error"; message: string }
  | null;

export async function createProviderPortalAccount(
  _prevState: ProviderAccountState,
  formData: FormData,
): Promise<ProviderAccountState> {
  const actor = await requireEmployee("providers.manage");
  const applicationId = z.string().uuid().safeParse(formData.get("applicationId"));
  if (!applicationId.success) return { status: "error", message: "Invalid application." };

  const application = await getProviderApplication(applicationId.data);
  if (!application) return { status: "error", message: "Application not found." };

  const tempPassword = randomBytes(12).toString("base64url");
  try {
    const account = await createProviderAccount({
      applicationId: application.id,
      password: tempPassword,
      actor: `${actor.fullName} (${actor.id})`,
    });
    revalidatePath("/admin/applicants");
    return { status: "success", email: account.email, tempPassword, action: "created" };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "23505") {
      return {
        status: "error",
        message: "A portal account already exists for this application or email.",
      };
    }
    throw error;
  }
}

export async function resetProviderPortalPassword(
  _prevState: ProviderAccountState,
  formData: FormData,
): Promise<ProviderAccountState> {
  const actor = await requireEmployee("providers.manage");
  const applicationId = z.string().uuid().safeParse(formData.get("applicationId"));
  if (!applicationId.success) return { status: "error", message: "Invalid application." };

  const tempPassword = randomBytes(12).toString("base64url");
  try {
    const account = await resetProviderAccountPassword({
      applicationId: applicationId.data,
      password: tempPassword,
      actor: `${actor.fullName} (${actor.id})`,
    });
    return { status: "success", email: account.email, tempPassword, action: "reset" };
  } catch {
    return { status: "error", message: "No portal account exists for this application yet." };
  }
}
