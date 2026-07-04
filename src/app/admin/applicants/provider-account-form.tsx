"use client";

import { useActionState } from "react";
import { CopyButton } from "@/components/copy-button";
import {
  createProviderPortalAccount,
  resetProviderPortalPassword,
  type ProviderAccountState,
} from "./actions";

export function ProviderAccountPanel({
  applicationId,
  hasAccount,
}: {
  applicationId: string;
  hasAccount: boolean;
}) {
  const [state, formAction, pending] = useActionState<ProviderAccountState, FormData>(
    hasAccount ? resetProviderPortalPassword : createProviderPortalAccount,
    null,
  );

  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Provider portal access</p>
          <p className="text-xs text-slate-500">
            {hasAccount
              ? "This provider has a portal account. Generate a new temporary password if they lost theirs."
              : "Issue portal credentials so this provider can sign in, request service qualifications, and receive invitations."}
          </p>
        </div>
        <form action={formAction}>
          <input type="hidden" name="applicationId" value={applicationId} />
          <button
            disabled={pending}
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {pending
              ? "Working…"
              : hasAccount
                ? "Reset portal password"
                : "Create portal account"}
          </button>
        </form>
      </div>

      {state?.status === "success" && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm">
          <span className="text-emerald-800">
            {state.action === "created" ? "Portal account created." : "Password reset."} They sign
            in at <span className="font-medium">/providers/login</span> with{" "}
            <span className="font-medium">{state.email}</span> and:
          </span>
          <code className="rounded-md bg-white px-3 py-1.5 font-mono font-semibold text-slate-900 ring-1 ring-inset ring-emerald-600/20">
            {state.tempPassword}
          </code>
          <CopyButton value={state.tempPassword} />
          <span className="w-full text-xs text-emerald-700">
            Shown once — share it securely.
          </span>
        </div>
      )}
      {state?.status === "error" && (
        <p className="mt-2 text-sm font-medium text-red-600">{state.message}</p>
      )}
    </div>
  );
}
