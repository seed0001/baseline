import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { requireEmployee } from "@/lib/employee-auth";
import {
  roleHasPermission,
  roleLabels,
  rolePermissions,
  type Permission,
} from "@/lib/permissions";

export const metadata = { title: "Operations — Baseline" };
export const dynamic = "force-dynamic";

const workspaces: Array<{
  title: string;
  description: string;
  href: string;
  permission: Permission;
}> = [
  {
    title: "Provider Applicants",
    description: "Review applications, request information, and manage screening stages.",
    href: "/admin/applicants",
    permission: "applicants.view",
  },
  {
    title: "Employees & Access",
    description: "Create staff accounts and manage roles, teams, and account status.",
    href: "/admin/employees",
    permission: "employees.view",
  },
  {
    title: "Pricing Operations",
    description: "Review catalog methodology, source freshness, and publication status.",
    href: "/methodology",
    permission: "pricing.view",
  },
  {
    title: "Project Operations",
    description: "Coordinate active projects, providers, milestones, and customer work.",
    href: "/dashboard",
    permission: "projects.view",
  },
];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const employee = await requireEmployee("admin.access");
  const { denied } = await searchParams;
  const available = workspaces.filter((workspace) =>
    roleHasPermission(employee.role, workspace.permission),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title={`Welcome, ${employee.fullName}`}
        description={`${roleLabels[employee.role]}${employee.team ? ` · ${employee.team}` : ""}`}
        action={
          <Link href="/staff/account" className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
            Account Settings
          </Link>
        }
      />

      {denied && (
        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Your role does not include access to that workspace.
        </p>
      )}

      <section className="mt-8">
        <h2 className="font-semibold text-slate-900">Your workspaces</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {available.map((workspace) => (
            <Link
              key={workspace.href}
              href={workspace.href}
              className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-teal-300 hover:shadow-sm"
            >
              <h3 className="font-semibold text-slate-900">{workspace.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{workspace.description}</p>
              <p className="mt-4 text-sm font-semibold text-teal-700">Open workspace →</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">Access granted by your role</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {[...rolePermissions[employee.role]].map((permission) => (
            <span key={permission} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
              {permission}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
