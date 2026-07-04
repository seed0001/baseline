"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireEmployee } from "@/lib/employee-auth";
import {
  decideServiceQualification,
  qualificationChecklist,
  type ChecklistId,
} from "@/lib/provider-accounts";

const decisionSchema = z.object({
  requestId: z.coerce.number().int().positive(),
  decision: z.enum(["qualified", "declined"]),
  note: z.string().trim().max(2000),
});

export async function decideQualification(formData: FormData) {
  const employee = await requireEmployee("providers.manage");
  const parsed = decisionSchema.safeParse({
    requestId: formData.get("requestId"),
    decision: formData.get("decision"),
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) throw new Error("Invalid qualification decision.");

  const checks = Object.fromEntries(
    qualificationChecklist.map((item) => [item.id, formData.get(`check_${item.id}`) === "on"]),
  ) as Record<ChecklistId, boolean>;

  if (parsed.data.decision === "qualified" && !Object.values(checks).every(Boolean)) {
    throw new Error("All checklist items must be confirmed before qualifying a provider.");
  }
  if (parsed.data.decision === "declined" && parsed.data.note.length === 0) {
    throw new Error("A note explaining the decline is required.");
  }

  await decideServiceQualification({
    id: parsed.data.requestId,
    decision: parsed.data.decision,
    decidedBy: `${employee.fullName} (${employee.id})`,
    checks,
    note: parsed.data.note,
  });
  revalidatePath("/admin/qualifications");
}
