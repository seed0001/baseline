"use client";

import { useState } from "react";
import Link from "next/link";

const budgetRanges = [
  "Under $250",
  "$250 – $1,000",
  "$1,000 – $5,000",
  "$5,000 – $15,000",
  "$15,000+",
  "Not sure — need guidance",
];

const timelines = [
  "As soon as possible",
  "Within 2 weeks",
  "Within a month",
  "1–3 months",
  "Flexible",
];

export function CustomRequestForm() {
  const [submitted, setSubmitted] = useState(false);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  if (submitted) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600 ring-1 ring-inset ring-emerald-600/20">
          ✓
        </span>
        <h2 className="mt-5 text-xl font-semibold text-slate-900">Custom request submitted</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
          Your request <span className="font-semibold text-slate-900">CSR-117</span> is now{" "}
          <span className="font-semibold text-amber-700">Pending Review</span>. Our team typically
          responds within 2 business days. You can track its status from your dashboard.
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
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="space-y-6 rounded-xl border border-slate-200 bg-white p-6"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <label className="block text-sm font-medium text-slate-700">
        What do you need done?
        <textarea
          required
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the work in as much detail as you can — what, where, materials or brands you prefer, and anything unusual about the site…"
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Location
          <input
            type="text"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Street address or ZIP code"
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Budget range
          <select className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20">
            {budgetRanges.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm font-medium text-slate-700">
        Timeline
        <select className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20">
          {timelines.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>

      <div>
        <p className="text-sm font-medium text-slate-700">Photos (optional)</p>
        <div className="mt-1.5 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center">
          <p className="text-sm font-medium text-slate-700">Drag photos here or click to upload</p>
          <p className="mt-1 text-xs text-slate-400">JPG or PNG, up to 10 MB each. We’ll request files during review.</p>
          <button
            type="button"
            className="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-100"
          >
            Choose Files
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
        <span className="font-semibold text-slate-900">Admin review:</span> every custom request is
        reviewed by a Baseline operator before pricing. If approved, this request may become a new
        Baseline catalog service.
      </div>

      <button
        type="submit"
        disabled={!description || !location}
        className="w-full rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        Submit Custom Request
      </button>
    </form>
  );
}
