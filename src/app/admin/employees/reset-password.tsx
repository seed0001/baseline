"use client";

import { useActionState } from "react";
import { CopyButton } from "@/components/copy-button";
import { resetEmployeePassword, type ResetPasswordState } from "./actions";

export function ResetPasswordButton({ employeeId }: { employeeId: string }) {
  const [state, formAction, pending] = useActionState<ResetPasswordState, FormData>(
    resetEmployeePassword,
    null,
  );

  return (
    <div className="mt-3">
      <form action={formAction} className="inline">
        <input type="hidden" name="employeeId" value={employeeId} />
        <button
          disabled={pending}
          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          {pending ? "Generating…" : "Reset password"}
        </button>
      </form>

      {state?.status === "success" && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm">
          <span className="text-emerald-800">New temporary password:</span>
          <code className="rounded-md bg-white px-3 py-1.5 font-mono font-semibold text-slate-900 ring-1 ring-inset ring-emerald-600/20">
            {state.tempPassword}
          </code>
          <CopyButton value={state.tempPassword} />
          <span className="w-full text-xs text-emerald-700 sm:w-auto">
            Shown once. Their old password and any active sessions are now invalid.
          </span>
        </div>
      )}
      {state?.status === "error" && (
        <p className="mt-2 text-sm font-medium text-red-600">{state.message}</p>
      )}
    </div>
  );
}
