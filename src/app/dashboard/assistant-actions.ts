"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { askAssistant } from "@/lib/ai";
import { getCatalogServices } from "@/lib/catalog";
import { formatCurrency } from "@/lib/data";

const messageSchema = z.string().trim().min(1).max(4000);
const visitorCookie = "baseline_visitor";

export async function sendCustomerMessage(message: string): Promise<string> {
  const parsed = messageSchema.safeParse(message);
  if (!parsed.success) throw new Error("Enter a message.");

  const store = await cookies();
  let visitorId = store.get(visitorCookie)?.value;
  if (!visitorId) {
    visitorId = randomUUID();
    store.set(visitorCookie, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  const services = await getCatalogServices();
  const catalog = services
    .map((s) => `${s.name} (${s.category}): ${formatCurrency(s.baselinePrice)} ${s.priceUnit}`)
    .join("; ");

  return askAssistant({
    audience: "customer",
    subjectId: visitorId,
    message: parsed.data,
    context: `Baseline catalog (baseline average prices, region-adjusted at quote time): ${catalog}`,
  });
}
