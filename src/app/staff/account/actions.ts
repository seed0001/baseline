"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { changeEmployeePassword, requireEmployee } from "@/lib/employee-auth";

const schema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string()
    .min(12)
    .max(200)
    .regex(/[A-Z]/, "Include an uppercase letter.")
    .regex(/[a-z]/, "Include a lowercase letter.")
    .regex(/[0-9]/, "Include a number."),
});

export async function changePassword(formData: FormData) {
  const employee = await requireEmployee();
  const parsed = schema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) throw new Error("The new password does not meet the requirements.");

  const changed = await changeEmployeePassword(
    employee.id,
    parsed.data.currentPassword,
    parsed.data.newPassword,
  );
  if (!changed) throw new Error("The current password is incorrect.");
  redirect("/staff/login?password=changed");
}
