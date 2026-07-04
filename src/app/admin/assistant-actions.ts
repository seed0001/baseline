"use server";

import { z } from "zod";
import { requireEmployee } from "@/lib/employee-auth";
import { roleLabels } from "@/lib/permissions";
import { askAssistant } from "@/lib/ai";
import { getPool } from "@/lib/db";

const messageSchema = z.string().trim().min(1).max(4000);

export async function sendStaffMessage(message: string): Promise<string> {
  const employee = await requireEmployee("admin.access");
  const parsed = messageSchema.safeParse(message);
  if (!parsed.success) throw new Error("Enter a message.");

  let workload = "";
  const pool = getPool();
  if (pool) {
    try {
      const [applications, qualifications] = await Promise.all([
        pool.query(
          "SELECT COUNT(*) FROM provider_applications WHERE status NOT IN ('approved', 'declined', 'withdrawn')",
        ),
        pool.query(
          "SELECT COUNT(*) FROM provider_service_qualifications WHERE status = 'requested'",
        ),
      ]);
      workload = `Open provider applications: ${applications.rows[0].count}. Pending qualification requests: ${qualifications.rows[0].count}.`;
    } catch {
      workload = "";
    }
  }

  return askAssistant({
    audience: "staff",
    subjectId: employee.id,
    message: parsed.data,
    context: `Staff member: ${employee.fullName}, role ${roleLabels[employee.role]}. ${workload}`,
  });
}
