"use client";

import { useActionState } from "react";
import { promoteApplicantToStaff, type PromoteApplicantState } from "./actions";

export function PromoteToStaffForm({
  applicationId,
  roles,
}: {
  applicationId: string;
  roles: { value: string; label: string }[];
}) {
  const [state, formAction, pending] = useActionState<PromoteApplicantState, FormData>(
    promoteApplicantToStaff,
    null,
  );

  if (state?.status === "success") {
    return (
      <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm">
        <p className="font-semibold text-emerald-900">
          Staff account created — {state.roleLabel}
        </p>
        <p className="mt-1 text-emerald-800">
          They sign in at <span className="font-medium">/staff/login</span> with{" "}
          <span className="font-medium">{state.email}</span> and this temporary password:
        </p>
        <p className="mt-2 rounded-md bg-white px-3 py-2 font-mono text-base font-semibold text-slate-900 ring-1 ring-inset ring-emerald-600/20">
          {state.tempPassword}
        </p>
        <p className="mt-2 text-xs text-emerald-700">
          Shown only once — share it securely and have them change it at /staff/account after
          first sign-in.
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[220px_1fr_auto]"
    >
      <input type="hidden" name="applicationId" value={applicationId} />
      <select
        name="role"
        defaultValue="support"
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
      >
        {roles.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      <input
        name="team"
        maxLength={100}
        placeholder="Team (optional)"
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
      />
      <button
        disabled={pending}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {pending ? "Creating…" : "Make staff member"}
      </button>
      {state?.status === "error" && (
        <p className="text-sm font-medium text-red-600 lg:col-span-3">{state.message}</p>
      )}
    </form>
  );
}
