"use client";

import { useActionState } from "react";
import { loginProvider, type ProviderLoginState } from "./actions";

const initialState: ProviderLoginState = {};

export function ProviderLoginForm() {
  const [state, action, pending] = useActionState(loginProvider, initialState);
  const inputClass =
    "mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20";

  return (
    <form action={action} className="mt-6 space-y-4">
      <label className="block text-sm font-medium text-slate-700">
        Email
        <input name="email" type="email" required autoComplete="username" className={inputClass} />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Password
        <input name="password" type="password" required autoComplete="current-password" className={inputClass} />
      </label>
      {state.message && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.message}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in to Provider Portal"}
      </button>
    </form>
  );
}
