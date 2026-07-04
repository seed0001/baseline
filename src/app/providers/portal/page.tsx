import { services, formatCurrency } from "@/lib/data";
import { Badge, PageHeader, StatCard } from "@/components/ui";
import { ServiceOptIn } from "./service-opt-in";

export const metadata = {
  title: "Provider Portal — Baseline",
};

const invitations = [
  {
    id: "JOB-8841",
    service: "Water Heater Replacement (40–50 gal)",
    location: "Pflugerville, TX 78660",
    date: "2026-07-07",
    payout: 920,
    urgency: "Priority",
    note: "Gas unit in garage, straightforward access. Photos on file.",
  },
  {
    id: "JOB-8836",
    service: "Replace Toilet",
    location: "Austin, TX 78745",
    date: "2026-07-05",
    payout: 260,
    urgency: "Standard",
    note: "Customer-supplied Kohler unit. Second-floor bathroom.",
  },
  {
    id: "JOB-8829",
    service: "Replace Toilet",
    location: "Round Rock, TX 78664",
    date: "2026-07-08",
    payout: 260,
    urgency: "Standard",
    note: "Flange condition unknown — inspection line item pre-approved.",
  },
];

const payouts = [
  { label: "PRJ-2041 · Phase 2 — Demolition assist", date: "2026-06-26", amount: 740, status: "Paid" },
  { label: "PRJ-2033 · Toilet Replacement", date: "2026-05-16", amount: 272, status: "Paid" },
  { label: "PRJ-2041 · Phase 3 — Rough plumbing", date: "Pending approval", amount: 1480, status: "In Escrow" },
];

export default function ProviderPortalPage() {
  const qualifiedIds = ["svc-101", "svc-102"];
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Provider Portal"
        description="Signed in as Marcus Webb · Webb Plumbing Co. · Approved provider since March 2026"
      />

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Earnings this month" value="$4,320" sub="$1,480 pending in escrow" />
        <StatCard label="Performance rating" value="4.9 ★" sub="142 completed jobs" />
        <StatCard label="Acceptance rate" value="87%" sub="Last 90 days" />
        <StatCard label="Open invitations" value={String(invitations.length)} sub="Respond within 24 hrs to hold your slot" />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          {/* Job invitations */}
          <section>
            <h2 className="text-lg font-semibold text-slate-900">Job invitations</h2>
            <p className="mt-1 text-sm text-slate-500">
              Jobs matched to your approved qualifications. Scope, photos, and payout are set by Baseline — accept or decline.
            </p>
            <div className="mt-4 space-y-4">
              {invitations.map((job) => (
                <div key={job.id} className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{job.service}</h3>
                        <Badge label={job.urgency} />
                      </div>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {job.id} · {job.location} · Requested for {job.date}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">{job.note}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Your payout</p>
                      <p className="text-xl font-semibold tracking-tight text-slate-900">{formatCurrency(job.payout)}</p>
                      <p className="text-xs text-slate-400">escrowed at acceptance</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                    <button className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
                      Accept Job
                    </button>
                    <button className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
                      Decline
                    </button>
                    <button className="ml-auto text-sm font-semibold text-teal-700 hover:text-teal-800">
                      View full scope →
                    </button>
                  </div>
                </div>
              ))}
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
            <div className="mt-4">
              <ServiceOptIn services={services} initialQualifiedIds={qualifiedIds} />
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Earnings */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">Recent payouts</h2>
            <div className="mt-3 divide-y divide-slate-100">
              {payouts.map((p) => (
                <div key={p.label} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{p.label}</p>
                    <p className="text-xs text-slate-400">{p.date}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-slate-900">{formatCurrency(p.amount)}</p>
                    <Badge label={p.status} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
              Year-to-date earnings: <span className="font-semibold text-slate-900">$28,640</span> ·
              Payouts land within 2 business days of customer approval.
            </div>
          </section>

          {/* Performance */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">Performance</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Overall rating</dt>
                <dd className="font-semibold text-slate-900">4.9 / 5.0 ★</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">On-time arrival</dt>
                <dd className="font-semibold text-slate-900">98%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">First-visit completion</dt>
                <dd className="font-semibold text-slate-900">94%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Rework rate</dt>
                <dd className="font-semibold text-slate-900">1.4%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Screening status</dt>
                <dd><Badge label="Approved" /></dd>
              </div>
            </dl>
            <p className="mt-4 rounded-lg bg-teal-50 p-3 text-xs text-teal-800 ring-1 ring-inset ring-teal-600/20">
              Providers rated 4.8+ get first access to Priority and Emergency invitations.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
