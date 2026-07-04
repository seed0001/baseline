"use server";

import { redirect } from "next/navigation";
import { destroyEmployeeSession } from "@/lib/employee-auth";

export async function logoutEmployee() {
  await destroyEmployeeSession();
  redirect("/staff/login");
}
