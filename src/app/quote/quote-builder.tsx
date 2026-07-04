"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ServiceTemplate } from "@/lib/data";
import { formatCurrency } from "@/lib/data";
import { regions, regionByCode, indexDeltaLabel } from "@/lib/regions";

const urgencyOptions = [
  { value: "standard", label: "Standard", note: "Next available slot", multiplier: 1 },
  { value: "priority", label: "Priority", note: "Within 48 hours", multiplier: 1.15 },
  { value: "emergency", label: "Emergency", note: "Same day", multiplier: 1.35 },
] as const;

const timelineOptions = [
  "As soon as possible",
  "Within 2 weeks",
  "Within a month",
  "1–3 months",
  "Flexible / just pricing",
];

export function QuoteBuilder({
  services,
  initialServiceId,
}: {
  services: ServiceTemplate[];
  initialServiceId: string | null;
}) {
  const [serviceId, setServiceId] = useState<string | null>(initialServiceId);
  const [urgency, setUrgency] = useState<(typeof urgencyOptions)[number]["value"]>("standard");
  const [timeline, setTimeline] = useState(timelineOptions[0]);
  const [location, setLocation] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [openToTravel, setOpenToTravel] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const service = useMemo(
    () => services.find((s) => s.id === serviceId) ?? null,
    [services, serviceId]
  );

  const region = useMemo(() => (stateCode ? regionByCode(stateCode) ?? null : null), [stateCode]);

  const estimate = useMemo(() => {
    if (!service) return null;
    const m = urgencyOptions.find((u) => u.value === urgency)?.multiplier ?? 1;
    const r = region?.index ?? 1;
    return {
      low: Math.round(service.baselinePrice * 0.85 * m * r),
      high: Math.round(service.baselinePrice * 1.25 * m * r),
    };
  }, [service, urgency, region]);

  if (submitted && service) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600 ring-1 ring-inset ring-emerald-600/20">
          ✓
        </span>
        <h2 className="mt-5 text-xl font-semibold text-slate-900">Quote request submitted</h2>
        <p className="mt-2 text-sm text-slate-600">
          Your request <span className="font-semibold text-slate-900">QR-3031</span> for{" "}
          <span className="font-semibold text-slate-900">{service.name}</span> is in review. Expect a
          firm proposal within one business day. Estimated range:{" "}
          <span className="font-semibold text-slate-900">
            {estimate && `${formatCurrency(estimate.low)} – ${formatCurrency(estimate.high)}`}
          </span>
          .
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={() => setSubmitted(false)}
            className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
          >
            Start Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Form */}
      <form
        className="space-y-8 lg:col-span-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (service) setSubmitted(true);
        }}
      >
        {/* Step 1: Service */}
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">1. Select a service</h2>
          <select
            value={serviceId ?? ""}
            onChange={(e) => setServiceId(e.target.value || null)}
            className="mt-4 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
          >
            <option value="">Choose from the Baseline catalog…</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.category} — {s.name} ({formatCurrency(s.baselinePrice)} {s.priceUnit})
              </option>
            ))}
          </select>
          {service && (
            <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm">
              <p className="text-slate-600">{service.description}</p>
              <p className="mt-3 font-medium text-slate-900">Required information:</p>
              <ul className="mt-1 list-inside list-disc text-slate-600">
                {service.requiredInfo.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="mt-3 text-xs text-slate-400">
            Don&apos;t see your service?{" "}
            <Link href="/custom-request" className="font-medium text-teal-700 hover:text-teal-800">
              Submit a custom request
            </Link>
            .
          </p>
        </section>

        {/* Step 2: Location */}
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">2. Job location</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <select
              required
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
            >
              <option value="">State…</option>
              {regions.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Street address or ZIP code"
              className="sm:col-span-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Onsite pricing adjusts to your state&apos;s cost index.{" "}
            {region ? (
              <span className="font-medium text-slate-500">
                {region.name}: ×{region.index.toFixed(2)} ({indexDeltaLabel(region.index)}).
              </span>
            ) : (
              <Link href="/pricing-map" className="font-medium text-teal-700 hover:text-teal-800">
                See the regional pricing map
              </Link>
            )}
          </p>

          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <input
              type="checkbox"
              checked={openToTravel}
              onChange={(e) => setOpenToTravel(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
            />
            <span className="text-sm">
              <span className="font-medium text-slate-900">
                Invite qualified providers who travel
              </span>
              <span className="mt-0.5 block text-slate-600">
                Include specialists from other states willing to travel for this job. Travel costs
                (mileage, lodging, logistics) appear as separate line items in their proposals —
                never hidden in the rate.
              </span>
            </span>
          </label>
        </section>

        {/* Step 3: Photos */}
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">
            3. Photos {service?.requiresPhotos ? <span className="text-sm font-normal text-amber-600">(required for this service)</span> : <span className="text-sm font-normal text-slate-400">(optional)</span>}
          </h2>
          <div className="mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
            <p className="text-sm font-medium text-slate-700">Drag photos here or click to upload</p>
            <p className="mt-1 text-xs text-slate-400">JPG or PNG, up to 10 MB each. We’ll request files during quote review.</p>
            <button
              type="button"
              className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-100"
            >
              Choose Files
            </button>
          </div>
        </section>

        {/* Step 4: Details */}
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">4. Details & scheduling</h2>

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Describe the job
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Anything a provider should know — access, existing damage, model preferences, measurements…"
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
            />
          </label>

          <fieldset className="mt-5">
            <legend className="text-sm font-medium text-slate-700">Urgency</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {urgencyOptions.map((u) => (
                <label
                  key={u.value}
                  className={`cursor-pointer rounded-lg border p-3 text-sm transition-colors ${
                    urgency === u.value
                      ? "border-teal-600 bg-teal-50 ring-1 ring-teal-600"
                      : "border-slate-300 bg-white hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="urgency"
                    value={u.value}
                    checked={urgency === u.value}
                    onChange={() => setUrgency(u.value)}
                    className="sr-only"
                  />
                  <span className="font-semibold text-slate-900">{u.label}</span>
                  <span className="block text-xs text-slate-500">{u.note}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="mt-5 block text-sm font-medium text-slate-700">
            Timeline
            <select
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
            >
              {timelineOptions.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
        </section>

        <button
          type="submit"
          disabled={!service || !location || !stateCode}
          className="w-full rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Submit Quote Request
        </button>
      </form>

      {/* Summary sidebar */}
      <aside className="lg:col-span-1">
        <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Quote summary</h2>
          {service ? (
            <>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Service</span>
                  <span className="text-right font-medium text-slate-900">{service.name}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Category</span>
                  <span className="font-medium text-slate-900">{service.category}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Baseline price</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(service.baselinePrice)} {service.priceUnit}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Est. duration</span>
                  <span className="font-medium text-slate-900">{service.estimatedDuration}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Skill level</span>
                  <span className="font-medium text-slate-900">{service.skillLevel}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Urgency</span>
                  <span className="font-medium text-slate-900 capitalize">{urgency}</span>
                </div>
                {region && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Region</span>
                    <span className="text-right font-medium text-slate-900">
                      {region.name} ×{region.index.toFixed(2)}
                    </span>
                  </div>
                )}
                {openToTravel && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Provider pool</span>
                    <span className="text-right font-medium text-slate-900">Local + traveling</span>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Timeline</span>
                  <span className="text-right font-medium text-slate-900">{timeline}</span>
                </div>
              </div>

              {estimate && (
                <div className="mt-5 rounded-lg bg-teal-50 p-4 ring-1 ring-inset ring-teal-600/20">
                  <p className="text-xs font-medium uppercase tracking-wide text-teal-800">
                    Estimated quote range
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-teal-900">
                    {formatCurrency(estimate.low)} – {formatCurrency(estimate.high)}
                  </p>
                  <p className="mt-1 text-xs text-teal-700">
                    Based on the baseline average, urgency,
                    {region ? ` the ${region.name} cost index,` : ""} and typical job variance.
                    Your firm proposal may differ after review.
                  </p>
                  {openToTravel && (
                    <p className="mt-2 border-t border-teal-600/20 pt-2 text-xs text-teal-700">
                      Traveling providers add itemized travel costs on top of this range.
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              Select a service to see baseline pricing and your estimated quote range.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
