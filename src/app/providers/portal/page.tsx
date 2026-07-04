import { formatCurrency } from "@/lib/data";
import { getCatalogServices } from "@/lib/catalog";
import { requireProvider } from "@/lib/provider-auth";
import { listProviderQualifications } from "@/lib/provider-accounts";
import type { ProviderApplicationStatus } from "@/lib/provider-applications";
import { getConversationHistory, type ChatMessage } from "@/lib/ai";
import { Badge, PageHeader, StatCard } from "@/components/ui";
import { ChatPanel } from "@/components/chat-panel";
import {
  requestQualification,
  sendProviderMessage,
  signOutProvider,
  withdrawQualification,
} from "./actions";

export const metadata = {
  title: "Provider Portal — Baseline",
};

export const dynamic = "force-dynamic";

const screeningLabels: Record<ProviderApplicationStatus, string> = {
  new: "Submitted",
  under_review: "Under Review",
  information_requested: "Information Requested",
  credentials: "Credentials Review",
  background_check: "Background Check",
  skill_review: "Skill Review",
  approved: "Approved",
  declined: "Declined",
  withdrawn: "Withdrawn",
};

export default async function ProviderPortalPage() {
  const provider = await requireProvider();
  const [services, qualifications] = await Promise.all([
    getCatalogServices(),
    listProviderQualifications(provider.id),
  ]);

  let assistantHistory: ChatMessage[] = [];
  try {
    assistantHistory = await getConversationHistory("provider", provider.id);
  } catch {
    assistantHistory = [];
  }

  const qualificationByService = new Map(qualifications.map((q) => [q.serviceId, q.status]));
  const qualifiedCount = qualifications.filter((q) => q.status === "qualified").length;
  const pendingCount = qualifications.filter((q) => q.status === "requested").length;
  const isApproved = provider.applicationStatus === "approved";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Provider Portal"
        description={`Signed in as ${provider.fullName} · ${provider.businessName} · ${provider.email}`}
        action={
          <form action={signOutProvider}>
            <button className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
              Sign out
            </button>
          </form>
        }
      />

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Screening status"
          value={screeningLabels[provider.applicationStatus]}
          sub={`Application ${provider.applicationReference}`}
        />
        <StatCard
          label="Qualified services"
          value={String(qualifiedCount)}
          sub={pendingCount > 0 ? `${pendingCount} awaiting review` : "Request more below"}
        />
        <StatCard
          label="Open invitations"
          value="0"
          sub={isApproved ? "You'll be notified when jobs match" : "Unlocks after screening approval"}
        />
        <StatCard
          label="Earnings to date"
          value={formatCurrency(0)}
          sub="Payouts land within 2 business days of approval"
        />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          {/* Job invitations */}
          <section>
            <h2 className="text-lg font-semibold text-slate-900">Job invitations</h2>
            <p className="mt-1 text-sm text-slate-500">
              Jobs matched to your qualified services. Scope, photos, and payout are set by
              Baseline — accept or decline with no penalty.
            </p>
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <h3 className="font-semibold text-slate-900">
                {isApproved ? "No invitations yet" : "Invitations unlock after approval"}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {isApproved
                  ? "When a funded job matches one of your qualified services in your area, it appears here with the scope and payout already set."
                  : `Your application is in ${screeningLabels[provider.applicationStatus].toLowerCase()}. Once you're approved and qualified for services, matched jobs appear here.`}
              </p>
            </div>
          </section>

          {/* Qualifications / service opt-in */}
          <section>
            <h2 className="text-lg font-semibold text-slate-900">My service qualifications</h2>
            <p className="mt-1 text-sm text-slate-500">
              Opt into catalog services you&apos;re qualified to perform. New selections go through a
              qualification review before you receive invitations. Providers cannot create or edit
              services — the catalog is owned and maintained by Baseline.
            </p>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Catalog service</th>
                    <th className="px-4 py-3">Baseline price</th>
                    <th className="px-4 py-3">Skill level</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {services.map((s) => {
                    const qualification = qualifications.find((q) => q.serviceId === s.id);
                    const status = qualificationByService.get(s.id);
                    return (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{s.name}</p>
                          <p className="text-xs text-slate-400">{s.category}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {formatCurrency(s.baselinePrice)}{" "}
                          <span className="text-xs text-slate-400">{s.priceUnit}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{s.skillLevel}</td>
                        <td className="px-4 py-3 text-right">
                          {status === "qualified" ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                              ✓ Qualified
                            </span>
                          ) : status === "requested" ? (
                            <form action={withdrawQualification} className="inline">
                              <input type="hidden" name="serviceId" value={s.id} />
                              <button className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 hover:bg-amber-100">
                                Pending review · Cancel
                              </button>
                            </form>
                          ) : status === "declined" ? (
                            <span
                              title={qualification?.decisionNote ?? undefined}
                              className="inline-flex flex-col items-end gap-1"
                            >
                              <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                                Not approved
                              </span>
                              {qualification?.decisionNote && (
                                <span className="max-w-56 text-right text-xs text-slate-400">
                                  {qualification.decisionNote}
                                </span>
                              )}
                            </span>
                          ) : (
                            <form action={requestQualification} className="inline">
                              <input type="hidden" name="serviceId" value={s.id} />
                              <button className="inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-teal-700 ring-1 ring-inset ring-teal-600/40 hover:bg-teal-50">
                                + Request qualification
                              </button>
                            </form>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {pendingCount > 0 && (
                <div className="border-t border-slate-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
                  {pendingCount} qualification request{pendingCount > 1 ? "s" : ""} awaiting
                  Baseline review — expect a decision within 3 business days.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Assistant */}
          <ChatPanel
            title="Provider Assistant"
            subtitle="Questions about screening, qualifications, or payouts — it knows where you stand."
            placeholder="e.g. Why is my qualification still pending?"
            emptyNote="Ask me about your screening progress, how to qualify for more services, or how payouts work."
            initialMessages={assistantHistory}
            send={sendProviderMessage}
          />

          {/* Screening status */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">Screening</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Application</dt>
                <dd className="font-semibold text-slate-900">{provider.applicationReference}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Status</dt>
                <dd><Badge label={screeningLabels[provider.applicationStatus]} /></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Portal member since</dt>
                <dd className="font-semibold text-slate-900">
                  {provider.memberSince.toLocaleDateString("en-US", { dateStyle: "medium" })}
                </dd>
              </div>
            </dl>
            {!isApproved && (
              <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 ring-1 ring-inset ring-amber-600/20">
                Screening is still in progress. You can request service qualifications now — they
                are reviewed once your application is approved.
              </p>
            )}
          </section>

          {/* Payouts */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">Recent payouts</h2>
            <p className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
              No payouts yet. Once you complete a milestone and the customer approves it, the
              escrowed payment lands here within 2 business days.
            </p>
          </section>

          {/* Performance */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">Performance</h2>
            <p className="mt-3 text-sm text-slate-500">
              Rating, on-time arrival, and first-visit completion metrics build as you complete
              Baseline jobs.
            </p>
            <p className="mt-4 rounded-lg bg-teal-50 p-3 text-xs text-teal-800 ring-1 ring-inset ring-teal-600/20">
              Providers rated 4.8+ get first access to Priority and Emergency invitations.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
