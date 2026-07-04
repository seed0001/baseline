"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireEmployee } from "@/lib/employee-auth";
import {
  createEmployee,
  getEmployee,
  setEmployeePassword,
  updateEmployee,
} from "@/lib/employees";
import { employeeRoles } from "@/lib/permissions";

const createSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  password: z.string().min(12).max(200),
  role: z.enum(employeeRoles),
  team: z.string().trim().max(100),
});

const updateSchema = z.object({
  employeeId: z.string().uuid(),
  role: z.enum(employeeRoles),
  status: z.enum(["active", "suspended", "terminated"]),
  team: z.string().trim().max(100),
});

export async function createEmployeeAccount(formData: FormData) {
  const actor = await requireEmployee("employees.manage");
  const parsed = createSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    team: formData.get("team") ?? "",
  });
  if (!parsed.success) throw new Error("Invalid employee account details.");
  if (parsed.data.role === "owner" && actor.role !== "owner") {
    throw new Error("Only an owner can create another owner.");
  }

  await createEmployee({ ...parsed.data, actorId: actor.id });
  revalidatePath("/admin/employees");
}

export async function updateEmployeeAccount(formData: FormData) {
  const actor = await requireEmployee("employees.manage");
  const parsed = updateSchema.safeParse({
    employeeId: formData.get("employeeId"),
    role: formData.get("role"),
    status: formData.get("status"),
    team: formData.get("team") ?? "",
  });
  if (!parsed.success) throw new Error("Invalid employee update.");

  const target = await getEmployee(parsed.data.employeeId);
  if (!target) throw new Error("Employee not found.");
  if ((target.role === "owner" || parsed.data.role === "owner") && actor.role !== "owner") {
    throw new Error("Only an owner can change an owner account.");
  }
  if (target.id === actor.id && parsed.data.status !== "active") {
    throw new Error("You cannot suspend or terminate your own account.");
  }
  if (target.id === actor.id && target.role === "owner" && parsed.data.role !== "owner") {
    throw new Error("An owner cannot remove their own owner access.");
  }

  await updateEmployee({ ...parsed.data, id: parsed.data.employeeId, actorId: actor.id });
  revalidatePath("/admin/employees");
}

export type ResetPasswordState =
  | { status: "success"; email: string; tempPassword: string }
  | { status: "error"; message: string }
  | null;

export async function resetEmployeePassword(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const actor = await requireEmployee("employees.manage");
  const employeeId = z.string().uuid().safeParse(formData.get("employeeId"));
  if (!employeeId.success) return { status: "error", message: "Invalid employee." };

  const target = await getEmployee(employeeId.data);
  if (!target) return { status: "error", message: "Employee not found." };
  if (target.role === "owner" && actor.role !== "owner") {
    return { status: "error", message: "Only an owner can reset an owner's password." };
  }
  if (target.id === actor.id) {
    return {
      status: "error",
      message: "Use /staff/account to change your own password.",
    };
  }

  const tempPassword = randomBytes(12).toString("base64url");
  await setEmployeePassword({ id: target.id, password: tempPassword, actorId: actor.id });
  revalidatePath("/admin/employees");
  return { status: "success", email: target.email, tempPassword };
}
