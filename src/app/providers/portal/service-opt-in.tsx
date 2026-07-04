"use client";

import { useState } from "react";
import type { ServiceTemplate } from "@/lib/data";
import { formatCurrency } from "@/lib/data";

export function ServiceOptIn({
  services,
  initialQualifiedIds,
}: {
  services: ServiceTemplate[];
  initialQualifiedIds: string[];
}) {
  const [qualified] = useState<Set<string>>(new Set(initialQualifiedIds));
  const [pending, setPending] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    if (qualified.has(id)) return; // approved qualifications are managed by Baseline
    setPending((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Catalog service</th>
            <th className="px-4 py-3">Baseline price</th>
            <th className="px-4 py-3">Skill level</th>
            <th className="px-4 py-3 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {services.map((s) => {
            const isQualified = qualified.has(s.id);
            const isPending = pending.has(s.id);
            return (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{s.name}</p>
                  <p className="text-xs text-slate-400">{s.category}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {formatCurrency(s.baselinePrice)} <span className="text-xs text-slate-400">{s.priceUnit}</span>
                </td>
                <td className="px-4 py-3 text-slate-600">{s.skillLevel}</td>
                <td className="px-4 py-3 text-right">
                  {isQualified ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                      ✓ Qualified
                    </span>
                  ) : isPending ? (
                    <button
                      onClick={() => toggle(s.id)}
                      className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 hover:bg-amber-100"
                    >
                      Pending review · Cancel
                    </button>
                  ) : (
                    <button
                      onClick={() => toggle(s.id)}
                      className="inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-teal-700 ring-1 ring-inset ring-teal-600/40 hover:bg-teal-50"
                    >
                      + Request qualification
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {pending.size > 0 && (
        <div className="border-t border-slate-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
          {pending.size} qualification request{pending.size > 1 ? "s" : ""} will be reviewed by
          Baseline — expect a decision within 3 business days.
        </div>
      )}
    </div>
  );
}
