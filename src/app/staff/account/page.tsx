import Link from "next/link";
import { requireEmployee } from "@/lib/employee-auth";
import { roleLabels } from "@/lib/permissions";
import { changePassword } from "./actions";

export const metadata = { title: "Staff Account — Baseline" };
export const dynamic = "force-dynamic";

export default async function StaffAccountPage() {
  const employee = await requireEmployee();
  const inputClass = "mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm";

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <Link href="/admin" className="text-sm font-medium text-teal-700 hover:underline">← Operations</Link>
      <section className="mt-5 rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-slate-900">Your staff account</h1>
        <p className="mt-2 text-sm text-slate-600">
          {employee.fullName} · {employee.email} · {roleLabels[employee.role]}
        </p>
        <form action={changePassword} className="mt-6 space-y-4 border-t border-slate-100 pt-5">
          <h2 className="font-semibold text-slate-900">Change password</h2>
          <label className="block text-sm font-medium text-slate-700">
            Current password
            <input name="currentPassword" type="password" required autoComplete="current-password" className={inputClass} />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            New password
            <input name="newPassword" type="password" required minLength={12} autoComplete="new-password" className={inputClass} />
            <span className="mt-1 block text-xs text-slate-500">At least 12 characters with upper/lowercase letters and a number.</span>
          </label>
          <button className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800">
            Change password and sign out
          </button>
        </form>
      </section>
    </div>
  );
}
