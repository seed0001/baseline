import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { requireEmployee } from "@/lib/employee-auth";
import { getCatalogServices } from "@/lib/catalog";
import {
  listPendingQualificationRequests,
  qualificationChecklist,
  type PendingQualificationRequest,
} from "@/lib/provider-accounts";
import { decideQualification } from "./actions";

export const metadata = {
  title: "Qualification Requests — Baseline Operations",
};

export const dynamic = "force-dynamic";

const banners: Record<string, { tone: "error" | "success"; text: string }> = {
  invalid: { tone: "error", text: "That decision could not be read — please try again." },
  checklist: {
    tone: "error",
    text: "All five checklist items must be confirmed before qualifying a provider.",
  },
  note: { tone: "error", text: "A note explaining the decline is required — it is shown to the provider." },
  decided: { tone: "error", text: "That request was already decided by someone else." },
  qualified: { tone: "success", text: "Provider qualified — the decision and checklist were recorded." },
  declined: { tone: "success", text: "Request declined — the reason was recorded and shown to the provider." },
};

export default async function QualificationRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; done?: string }>;
}) {
  await requireEmployee("providers.manage");
  const { error, done } = await searchParams;
  const banner = banners[error ?? done ?? ""] ?? null;
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

      {banner && (
        <p
          className={`mt-6 rounded-lg border p-4 text-sm ${
            banner.tone === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {banner.text}
        </p>
      )}

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
              </div>

              <form action={decideQualification} className="mt-5 border-t border-slate-100 pt-4">
                <input type="hidden" name="requestId" value={request.id} />
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Qualification review — every item is recorded with your decision
                </p>
                <div className="mt-3 grid gap-2 lg:grid-cols-2">
                  {qualificationChecklist.map((item) => (
                    <label
                      key={item.id}
                      className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm"
                    >
                      <input
                        type="checkbox"
                        name={`check_${item.id}`}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
                      />
                      <span className="text-slate-700">{item.label}</span>
                    </label>
                  ))}
                </div>
                <textarea
                  name="note"
                  rows={2}
                  maxLength={2000}
                  placeholder="Decision note — what you verified, or why this is being declined (required to decline; shown to the provider if declined)"
                  className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                />
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    name="decision"
                    value="qualified"
                    className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                  >
                    Qualify
                  </button>
                  <button
                    name="decision"
                    value="declined"
                    className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-red-700 ring-1 ring-inset ring-red-200 hover:bg-red-50"
                  >
                    Decline
                  </button>
                  <span className="text-xs text-slate-400">
                    Qualify requires all checklist items confirmed · Decline requires a note
                  </span>
                </div>
              </form>
            </article>
          );
        })}
      </div>
    </div>
  );
}
