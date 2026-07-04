"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/data";
import { regions, adjustedPrice, indexDeltaLabel } from "@/lib/regions";

export interface SampleService {
  id: string;
  name: string;
  baselinePrice: number;
  priceUnit: string;
}

function tileClasses(index: number): string {
  if (index <= 0.9) return "bg-teal-50 text-teal-900 hover:bg-teal-100";
  if (index <= 0.95) return "bg-teal-100 text-teal-900 hover:bg-teal-200";
  if (index <= 1.0) return "bg-teal-200 text-teal-900 hover:bg-teal-300";
  if (index <= 1.05) return "bg-teal-400 text-white hover:bg-teal-500";
  if (index <= 1.12) return "bg-teal-600 text-white hover:bg-teal-700";
  return "bg-teal-800 text-white hover:bg-teal-900";
}

const legend = [
  { label: "≤ −10%", classes: "bg-teal-50" },
  { label: "−10 to −5%", classes: "bg-teal-100" },
  { label: "−5 to 0%", classes: "bg-teal-200" },
  { label: "0 to +5%", classes: "bg-teal-400" },
  { label: "+5 to +12%", classes: "bg-teal-600" },
  { label: "> +12%", classes: "bg-teal-800" },
];

export function RegionalHeatMap({ sampleServices }: { sampleServices: SampleService[] }) {
  const [selectedCode, setSelectedCode] = useState("TX");
  const selected = regions.find((r) => r.code === selectedCode) ?? regions[0];

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Tile-grid map */}
      <div className="lg:col-span-2">
        <div
          className="grid gap-1.5"
          style={{ gridTemplateColumns: "repeat(12, minmax(0, 1fr))" }}
        >
          {regions.map((r) => (
            <button
              key={r.code}
              type="button"
              onClick={() => setSelectedCode(r.code)}
              title={`${r.name} — ${indexDeltaLabel(r.index)}`}
              style={{ gridColumnStart: r.col + 1, gridRowStart: r.row + 1 }}
              className={`flex aspect-square items-center justify-center rounded-md text-[11px] font-semibold transition-colors ${tileClasses(r.index)} ${
                r.code === selectedCode ? "ring-2 ring-slate-900 ring-offset-1" : ""
              }`}
            >
              {r.code}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
          <span className="font-medium text-slate-600">Cost vs. national baseline:</span>
          {legend.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5">
              <span className={`h-3 w-3 rounded ${l.classes}`} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {/* Selected state detail */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Selected region</p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <h3 className="text-xl font-semibold tracking-tight text-slate-900">{selected.name}</h3>
          <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700 ring-1 ring-inset ring-teal-600/20 whitespace-nowrap">
            {indexDeltaLabel(selected.index)}
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Onsite work in {selected.name} is estimated at{" "}
          <span className="font-semibold text-slate-900">×{selected.index.toFixed(2)}</span> the
          national baseline. Digital and professional services are priced nationally.
        </p>
        <div className="mt-5 border-t border-slate-200 pt-4">
          <p className="text-sm font-medium text-slate-700">Example baselines in {selected.name}</p>
          <div className="mt-3 space-y-3">
            {sampleServices.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-600">{s.name}</span>
                <span className="whitespace-nowrap text-right">
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(adjustedPrice(s.baselinePrice, selected.index))}
                  </span>
                  <span className="ml-1.5 text-xs text-slate-400 line-through">
                    {selected.index !== 1 ? formatCurrency(s.baselinePrice) : ""}
                  </span>
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-400">
            National baseline shown struck through when the region differs. Firm quotes always
            reflect the actual scope and site conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
