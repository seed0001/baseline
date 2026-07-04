"use client";

import { useActionState } from "react";
import {
  submitProviderApplication,
  type ProviderApplicationFormState,
} from "./actions";

const initialState: ProviderApplicationFormState = { status: "idle" };

function FieldError({
  errors,
  name,
}: {
  errors?: Record<string, string[]>;
  name: string;
}) {
  const message = errors?.[name]?.[0];
  return message ? <span className="mt-1 block text-xs text-red-600">{message}</span> : null;
}

export function ProviderApplicationForm({
  fields,
}: {
  fields: Array<{ id: string; name: string }>;
}) {
  const [state, formAction, pending] = useActionState(
    submitProviderApplication,
    initialState,
  );

  if (state.status === "success") {
    return (
      <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <p className="text-sm font-semibold text-emerald-900">Application received</p>
        <p className="mt-2 text-sm text-emerald-800">{state.message}</p>
        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-emerald-700">
          Your reference
        </p>
        <p className="mt-1 font-mono text-lg font-bold text-emerald-950">{state.reference}</p>
        <p className="mt-3 text-xs text-emerald-700">
          Save this reference. The operations team will use the email and phone number you
          provided if more information is needed.
        </p>
      </div>
    );
  }

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20";

  return (
    <form action={formAction} className="mt-6 space-y-5">
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Full name
          <input name="fullName" required autoComplete="name" className={inputClass} />
          <FieldError errors={state.errors} name="fullName" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Business name
          <input name="businessName" required autoComplete="organization" className={inputClass} />
          <FieldError errors={state.errors} name="businessName" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input name="email" required type="email" autoComplete="email" className={inputClass} />
          <FieldError errors={state.errors} name="email" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Phone
          <input name="phone" required type="tel" autoComplete="tel" className={inputClass} />
          <FieldError errors={state.errors} name="phone" />
        </label>
      </div>

      <label className="block text-sm font-medium text-slate-700">
        Primary field
        <select name="primaryField" required defaultValue="" className={inputClass}>
          <option value="" disabled>Select your primary field…</option>
          {fields.map((field) => (
            <option key={field.id} value={field.name}>{field.name}</option>
          ))}
        </select>
        <FieldError errors={state.errors} name="primaryField" />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Years of experience
        <select name="experienceRange" defaultValue="2–5 years" className={inputClass}>
          <option>Less than 2 years</option>
          <option>2–5 years</option>
          <option>5–10 years</option>
          <option>10+ years</option>
        </select>
      </label>

      <fieldset className="text-sm font-medium text-slate-700">
        <legend>Licensing &amp; insurance</legend>
        <div className="mt-2 space-y-2 text-sm font-normal text-slate-600">
          <label className="flex items-center gap-2.5">
            <input name="hasTradeLicense" type="checkbox" className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600" />
            I hold an active state/trade license (where applicable)
          </label>
          <label className="flex items-center gap-2.5">
            <input name="hasLiabilityInsurance" type="checkbox" className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600" />
            I carry general liability insurance ($1M minimum)
          </label>
          <label className="flex items-center gap-2.5">
            <input name="consentsToBackgroundCheck" required type="checkbox" className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600" />
            I consent to identity and background screening
          </label>
          <FieldError errors={state.errors} name="consentsToBackgroundCheck" />
        </div>
      </fieldset>

      <label className="block text-sm font-medium text-slate-700">
        Tell us about your work
        <textarea
          name="workDescription"
          required
          minLength={30}
          maxLength={3000}
          rows={4}
          placeholder="Typical jobs, crew size, service area, and the work you’re strongest at…"
          className={inputClass}
        />
        <FieldError errors={state.errors} name="workDescription" />
      </label>

      {state.status === "error" && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Submitting securely…" : "Submit Application"}
      </button>
      <p className="text-xs text-slate-400">
        Your information is used for provider screening and operations review.
      </p>
    </form>
  );
}
