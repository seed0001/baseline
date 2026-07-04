"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireEmployee } from "@/lib/employee-auth";
import {
  providerApplicationStatuses,
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
