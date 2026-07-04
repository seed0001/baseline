import Link from "next/link";
import { requireEmployee } from "@/lib/employee-auth";
import { roleHasPermission, roleLabels } from "@/lib/permissions";
import { logoutEmployee } from "./actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const employee = await requireEmployee("admin.access");

  return (
    <>
      <div className="border-b border-slate-200 bg-slate-900 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin" className="font-semibold">Operations</Link>
            {roleHasPermission(employee.role, "applicants.view") && (
              <Link href="/admin/applicants" className="text-slate-300 hover:text-white">Applicants</Link>
            )}
            {roleHasPermission(employee.role, "providers.manage") && (
              <Link href="/admin/qualifications" className="text-slate-300 hover:text-white">Qualifications</Link>
            )}
            {roleHasPermission(employee.role, "employees.view") && (
              <Link href="/admin/employees" className="text-slate-300 hover:text-white">Employees</Link>
            )}
          </nav>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-300">
              {employee.fullName} · {roleLabels[employee.role]}
            </span>
            <Link href="/staff/account" className="font-medium text-slate-300 hover:text-white">Account</Link>
            <form action={logoutEmployee}>
              <button className="rounded-md bg-white/10 px-3 py-1.5 font-medium hover:bg-white/20">Sign out</button>
            </form>
          </div>
        </div>
      </div>
      {children}
    </>
  );
}
