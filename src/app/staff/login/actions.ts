"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { authenticateEmployee, createEmployeeSession } from "@/lib/employee-auth";

export type LoginState = { message?: string };

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(200),
});

export async function loginEmployee(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { message: "Enter a valid email address and password." };

  const employee = await authenticateEmployee(parsed.data.email, parsed.data.password);
  if (!employee) return { message: "The email or password is incorrect, or this account is unavailable." };

  await createEmployeeSession(employee.id);
  redirect("/admin");
}
