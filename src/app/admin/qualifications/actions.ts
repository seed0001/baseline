"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireEmployee } from "@/lib/employee-auth";
import { decideServiceQualification } from "@/lib/provider-accounts";

const decisionSchema = z.object({
  requestId: z.coerce.number().int().positive(),
  decision: z.enum(["qualified", "declined"]),
});

export async function decideQualification(formData: FormData) {
  const employee = await requireEmployee("providers.manage");
  const parsed = decisionSchema.safeParse({
    requestId: formData.get("requestId"),
    decision: formData.get("decision"),
  });
  if (!parsed.success) throw new Error("Invalid qualification decision.");

  await decideServiceQualification({
    id: parsed.data.requestId,
    decision: parsed.data.decision,
    decidedBy: `${employee.fullName} (${employee.id})`,
  });
  revalidatePath("/admin/qualifications");
}
