import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { requireEmployee } from "@/lib/employee-auth";
import { getCatalogServices } from "@/lib/catalog";
import {
  listPendingQualificationRequests,
  type PendingQualificationRequest,
} from "@/lib/provider-accounts";
import { decideQualification } from "./actions";

export const metadata = {
  title: "Qualification Requests — Baseline Operations",
};

export const dynamic = "force-dynamic";

export default async function QualificationRequestsPage() {
  await requireEmployee("providers.manage");
  let requests: PendingQualificationRequest[] = [];
  let databaseReady = true;
  let serviceById = new Map<string, { name: string; category: string; skillLevel: string }>();

  try {
    const [pending, services] = await Promise.all([
      listPendingQualificationRequests(),
      getCatalogServices(),
    ]);
    requests = pending;
    serviceById = new Map(
      services.map((s) => [s.id, { name: s.name, category: s.category, skillLevel: s.skillLevel }]),
    );
  } catch {
    databaseReady = false;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Service Qualification Requests"
        description={`${requests.length} pending request${requests.length === 1 ? "" : "s"} — approve to start sending matched invitations`}
        action={
          <Link href="/admin" className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
            Back to Operations
          </Link>
        }
      />

      {!databaseReady && (
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          Qualification storage is not connected in this environment. Configure PostgreSQL and run
          the database migrations first.
        </div>
      )}

      {databaseReady && requests.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <h2 className="font-semibold text-slate-900">No pending qualification requests</h2>
          <p className="mt-2 text-sm text-slate-500">
            When a provider opts into a catalog service from their portal, the request appears
            here for review.
          </p>
        </div>
      )}

      <div className="mt-8 space-y-4">
        {requests.map((request) => {
          const service = serviceById.get(request.serviceId);
          const screeningApproved = request.applicationStatus === "approved";
          return (
            <article key={request.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    {service?.name ?? request.serviceId}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {service ? `${service.category} · ${service.skillLevel} · ` : ""}
                    Requested{" "}
                    {request.requestedAt.toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    <span className="font-medium">{request.providerName}</span> ·{" "}
                    {request.businessName}
                  </p>
                  <p className="text-xs text-slate-400">
                    {request.applicationReference} · {request.email}
                  </p>
                  {!screeningApproved && (
                    <p className="mt-2 inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                      Screening not yet approved — application is {request.applicationStatus.replace(/_/g, " ")}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <form action={decideQualification}>
                    <input type="hidden" name="requestId" value={request.id} />
                    <input type="hidden" name="decision" value="qualified" />
                    <button className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
                      Qualify
                    </button>
                  </form>
                  <form action={decideQualification}>
                    <input type="hidden" name="requestId" value={request.id} />
                    <input type="hidden" name="decision" value="declined" />
                    <button className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-red-700 ring-1 ring-inset ring-red-200 hover:bg-red-50">
                      Decline
                    </button>
                  </form>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
