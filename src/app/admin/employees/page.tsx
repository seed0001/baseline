import { PageHeader } from "@/components/ui";
import { requireEmployee } from "@/lib/employee-auth";
import { listEmployees } from "@/lib/employees";
import {
  employeeRoles,
  roleLabels,
  rolePermissions,
} from "@/lib/permissions";
import { createEmployeeAccount, updateEmployeeAccount } from "./actions";
import { ResetPasswordButton } from "./reset-password";

export const metadata = { title: "Employee Access — Baseline Operations" };
export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const current = await requireEmployee("employees.view");
  const employees = await listEmployees();
  const canManage = rolePermissions[current.role].has("employees.manage");
  const assignableRoles =
    current.role === "owner" ? employeeRoles : employeeRoles.filter((role) => role !== "owner");
  const inputClass = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Employees & Access"
        description="Individual staff accounts, job roles, teams, and revocable access"
      />

      {canManage && (
        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-900">Create employee account</h2>
          <p className="mt-1 text-xs text-slate-500">
            Give the employee their temporary password through a secure channel.
          </p>
          <form action={createEmployeeAccount} className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <input name="fullName" required placeholder="Full name" className={inputClass} />
            <input name="email" required type="email" placeholder="Work email" className={inputClass} />
            <input name="password" required type="password" minLength={12} placeholder="Temporary password" className={inputClass} />
            <select name="role" className={inputClass}>
              {assignableRoles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
            </select>
            <input name="team" placeholder="Team (optional)" className={inputClass} />
            <button className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 md:col-span-2 lg:col-span-5">
              Create employee
            </button>
          </form>
        </section>
      )}

      <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">{employees.length} employee accounts</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {employees.map((employee) => (
            <div key={employee.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{employee.fullName}</p>
                  <p className="text-sm text-slate-600">{employee.email}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Last sign-in: {employee.lastLoginAt ? employee.lastLoginAt.toLocaleString() : "Never"}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  employee.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                }`}>
                  {employee.status}
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                {rolePermissions[employee.role].size} permissions · {roleLabels[employee.role]}
              </p>
              {canManage && (
                <form action={updateEmployeeAccount} className="mt-3 grid gap-3 sm:grid-cols-4">
                  <input type="hidden" name="employeeId" value={employee.id} />
                  <select name="role" defaultValue={employee.role} className={inputClass}>
                    {assignableRoles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
                  </select>
                  <select name="status" defaultValue={employee.status} className={inputClass}>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="terminated">Terminated</option>
                  </select>
                  <input name="team" defaultValue={employee.team ?? ""} placeholder="Team" className={inputClass} />
                  <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                    Save access
                  </button>
                </form>
              )}
              {canManage && employee.id !== current.id && (
                <ResetPasswordButton employeeId={employee.id} />
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
