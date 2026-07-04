import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { requireEmployee } from "@/lib/employee-auth";
import { listEmployees } from "@/lib/employees";
import { employeeRoles, roleHasPermission, roleLabels } from "@/lib/permissions";
import {
  listProviderApplications,
  providerApplicationStatuses,
  type ProviderApplication,
  type ProviderApplicationStatus,
} from "@/lib/provider-applications";
import { listProviderAccountApplicationIds } from "@/lib/provider-accounts";
import { updateApplicantStatus } from "./actions";
import { PromoteToStaffForm } from "./promote-form";
import { ProviderAccountPanel } from "./provider-account-form";

export const metadata = {
  title: "Provider Applicants — Baseline Operations",
};

export const dynamic = "force-dynamic";

const statusLabels: Record<ProviderApplicationStatus, string> = {
  new: "New",
  under_review: "Under review",
  information_requested: "Information requested",
  credentials: "Credentials",
  background_check: "Background check",
  skill_review: "Skill review",
  approved: "Approved",
  declined: "Declined",
  withdrawn: "Withdrawn",
};

export default async function ProviderApplicantsPage() {
  const viewer = await requireEmployee("applicants.view");
  const canManageEmployees = roleHasPermission(viewer.role, "employees.manage");
  const canManageProviders = roleHasPermission(viewer.role, "providers.manage");
  let applications: ProviderApplication[] = [];
  let databaseReady = true;
  let staffEmails = new Set<string>();
  let portalAccountIds = new Set<string>();

  try {
    applications = await listProviderApplications();
    if (canManageEmployees) {
      staffEmails = new Set((await listEmployees()).map((e) => e.email.toLowerCase()));
    }
    if (canManageProviders) {
      portalAccountIds = await listProviderAccountApplicationIds();
    }
  } catch {
    databaseReady = false;
  }

  const promotableRoles = employeeRoles
    .filter((role) => role !== "owner" || viewer.role === "owner")
    .map((role) => ({ value: role, label: roleLabels[role] }));

  const activeCount = applications.filter(
    (application) => !["approved", "declined", "withdrawn"].includes(application.status),
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Provider Applicant Pipeline"
        description={`${activeCount} active applicants · ${applications.length} total applications`}
        action={
          <Link href="/admin" className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
            Back to Operations
          </Link>
        }
      />

      {!databaseReady && (
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          Applicant storage is not connected in this environment. Configure PostgreSQL and run
          the database migrations before accepting applications.
        </div>
      )}

      {databaseReady && applications.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <h2 className="font-semibold text-slate-900">No provider applications yet</h2>
          <p className="mt-2 text-sm text-slate-500">
            New submissions from the provider application will appear here immediately.
          </p>
        </div>
      )}

      <div className="mt-8 space-y-5">
        {applications.map((application) => (
          <article key={application.id} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-slate-900">{application.fullName}</h2>
                  <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
                    {statusLabels[application.status]}
                  </span>
                  {staffEmails.has(application.email.toLowerCase()) && (
                    <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-medium text-white">
                      Staff member
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-600">{application.businessName}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {application.reference} · Submitted{" "}
                  {application.submittedAt.toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <div className="text-right text-sm">
                <a className="block font-medium text-teal-700 hover:underline" href={`mailto:${application.email}`}>
                  {application.email}
                </a>
                <a className="mt-1 block text-slate-600 hover:underline" href={`tel:${application.phone}`}>
                  {application.phone}
                </a>
              </div>
            </div>

            <dl className="mt-5 grid gap-4 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Primary field</dt>
                <dd className="mt-1 text-slate-800">{application.primaryField}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Experience</dt>
                <dd className="mt-1 text-slate-800">{application.experienceRange}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Trade license</dt>
                <dd className="mt-1 text-slate-800">{application.hasTradeLicense ? "Reported" : "Not reported"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Liability insurance</dt>
                <dd className="mt-1 text-slate-800">{application.hasLiabilityInsurance ? "Reported" : "Not reported"}</dd>
              </div>
            </dl>

            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">About their work</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{application.workDescription}</p>
            </div>

            <form action={updateApplicantStatus} className="mt-5 grid gap-3 border-t border-slate-100 pt-4 lg:grid-cols-[220px_1fr_auto]">
              <input type="hidden" name="applicationId" value={application.id} />
              <select
                name="status"
                defaultValue={application.status}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                {providerApplicationStatuses.map((status) => (
                  <option key={status} value={status}>{statusLabels[status]}</option>
                ))}
              </select>
              <input
                name="note"
                maxLength={2000}
                placeholder="Internal note for this status change"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <button className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
                Save update
              </button>
            </form>

            {canManageProviders && (
              <ProviderAccountPanel
                applicationId={application.id}
                hasAccount={portalAccountIds.has(application.id)}
              />
            )}

            {canManageEmployees && !staffEmails.has(application.email.toLowerCase()) && (
              <PromoteToStaffForm applicationId={application.id} roles={promotableRoles} />
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
