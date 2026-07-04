import Link from "next/link";
import { cookies } from "next/headers";
import { projects, quoteRequests, formatCurrency, formatDate } from "@/lib/data";
import { getConversationHistory, type ChatMessage } from "@/lib/ai";
import { Badge, PageHeader, ProgressBar, StatCard } from "@/components/ui";
import { ChatPanel } from "@/components/chat-panel";
import { sendCustomerMessage } from "./assistant-actions";

export const metadata = {
  title: "Customer Dashboard — Baseline",
};

const messages = [
  { from: "Alex Fontaine (Codeline)", preview: "Sprint 2 demo is set for July 10 — order workflow is 80% done…", date: "2026-07-02", unread: true },
  { from: "Baseline Ops", preview: "Your rough-in inspection is confirmed for July 3 at 9:00 AM…", date: "2026-07-01", unread: true },
  { from: "Marcus Oduya (Golden Hour)", preview: "Revised concept B is up — new color system attached for your…", date: "2026-07-02", unread: true },
  { from: "Marcus Webb", preview: "Drain relocation is going smoothly — photos attached of the…", date: "2026-06-30", unread: false },
];

const documents = [
  { name: "Proposal PRO-1188 (signed).pdf", size: "412 KB", date: "2026-06-05" },
  { name: "Requirements spec v1.2 — Inventory System.pdf", size: "1.1 MB", date: "2026-05-29" },
  { name: "Brand concepts — direction B (rev 2).pdf", size: "6.4 MB", date: "2026-07-02" },
  { name: "Permit — City of Austin #BP-26-04412.pdf", size: "188 KB", date: "2026-06-11" },
  { name: "Demo completion photos (6).zip", size: "8.2 MB", date: "2026-06-24" },
];

export default async function DashboardPage() {
  const visitorId = (await cookies()).get("baseline_visitor")?.value;
  let assistantHistory: ChatMessage[] = [];
  if (visitorId) {
    try {
      assistantHistory = await getConversationHistory("customer", visitorId);
    } catch {
      assistantHistory = [];
    }
  }

  const active = projects.filter((p) => p.status !== "Complete");
  const completed = projects.filter((p) => p.status === "Complete");
  const activeQuotes = quoteRequests.filter(
    (q) => q.customer === "Sarah Mitchell" && q.status !== "Accepted" && q.status !== "Expired"
  );
  const pendingApprovals = active.flatMap((p) =>
    p.milestones
      .filter((m) => m.status === "Awaiting Approval" || (m.status === "In Progress" && m.paymentStatus === "In Escrow"))
      .map((m) => ({ project: p, milestone: m }))
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Welcome back, Sarah"
        description="Here's what's happening across your quotes and projects."
        action={
          <Link
            href="/quote"
            className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            + New Quote Request
          </Link>
        }
      />

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active quote requests" value={String(activeQuotes.length)} sub="1 awaiting your review" />
        <StatCard label="Active projects" value={String(active.length)} sub="Remodel, software build & brand campaign" />
        <StatCard label="Pending approvals" value={String(pendingApprovals.length)} sub="Escrow release awaiting sign-off" />
        <StatCard label="Paid to date" value={formatCurrency(projects.reduce((s, p) => s + p.paidToDate, 0))} sub="Across all projects" />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          {/* Active quotes */}
          <section>
            <h2 className="text-lg font-semibold text-slate-900">Active quote requests</h2>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Request</th>
                    <th className="px-4 py-3">Submitted</th>
                    <th className="px-4 py-3">Est. range</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeQuotes.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{q.serviceName}</p>
                        <p className="text-xs text-slate-400">{q.id} · {q.location}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(q.submittedDate)}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatCurrency(q.estimateLow)} – {formatCurrency(q.estimateHigh)}
                      </td>
                      <td className="px-4 py-3"><Badge label={q.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Quoted requests become proposals — view proposals:{" "}
              <Link href="/proposals/PRO-1188" className="font-medium text-teal-700 hover:text-teal-800">
                PRO-1188 Bathroom Remodel
              </Link>
              {" · "}
              <Link href="/proposals/PRO-1195" className="font-medium text-teal-700 hover:text-teal-800">
                PRO-1195 Inventory Management System
              </Link>
              {" · "}
              <Link href="/proposals/PRO-1201" className="font-medium text-teal-700 hover:text-teal-800">
                PRO-1201 Toilet Replacement
              </Link>
            </p>
          </section>

          {/* Active projects */}
          <section>
            <h2 className="text-lg font-semibold text-slate-900">Active projects</h2>
            <div className="mt-4 space-y-4">
              {active.map((p) => {
                const done = p.milestones.filter((m) => m.status === "Complete").length;
                const pct = Math.round(
                  p.milestones.reduce((s, m) => s + m.completion, 0) / p.milestones.length
                );
                return (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="block rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{p.name}</p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {p.id} · Started {formatDate(p.startDate)} · Target {formatDate(p.targetDate)}
                        </p>
                      </div>
                      <Badge label={p.status} />
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{done} of {p.milestones.length} milestones complete</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="mt-1.5">
                        <ProgressBar value={pct} />
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 border-t border-slate-100 pt-3 text-sm">
                      <span className="text-slate-500">
                        Budget <span className="font-semibold text-slate-900">{formatCurrency(p.budget)}</span>
                      </span>
                      <span className="text-slate-500">
                        Paid <span className="font-semibold text-slate-900">{formatCurrency(p.paidToDate)}</span>
                      </span>
                      <span className="text-slate-500">
                        In escrow{" "}
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(p.payments.filter((x) => x.status === "In Escrow").reduce((s, x) => s + x.amount, 0))}
                        </span>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Completed projects */}
          <section>
            <h2 className="text-lg font-semibold text-slate-900">Completed projects</h2>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Project</th>
                    <th className="px-4 py-3">Completed</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {completed.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Link href={`/projects/${p.id}`} className="font-medium text-slate-900 hover:text-teal-700">
                          {p.name}
                        </Link>
                        <p className="text-xs text-slate-400">{p.id}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(p.targetDate)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatCurrency(p.budget)}</td>
                      <td className="px-4 py-3"><Badge label="Paid" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Assistant */}
          <ChatPanel
            title="Baseline Assistant"
            subtitle="Find the right service, understand the pricing evidence, or ask how milestones work."
            placeholder="e.g. What should a water heater replacement cost?"
            emptyNote="Ask me about any catalog service, what fair pricing looks like, or how escrowed milestone payments protect you."
            initialMessages={assistantHistory}
            send={sendCustomerMessage}
          />

          {/* Pending approvals */}
          <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="font-semibold text-slate-900">Pending your approval</h2>
            {pendingApprovals.length > 0 ? (
              <div className="mt-3 space-y-3">
                {pendingApprovals.map(({ project, milestone }) => (
                  <div key={milestone.id} className="rounded-lg border border-amber-200 bg-white p-4">
                    <p className="text-sm font-medium text-slate-900">{milestone.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {project.name} · {formatCurrency(milestone.amount)} in escrow
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Link
                        href={`/projects/${project.id}`}
                        className="rounded-md bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-800"
                      >
                        Review & Approve
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-600">Nothing waiting on you right now.</p>
            )}
          </section>

          {/* Messages */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Messages</h2>
              <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700">2 new</span>
            </div>
            <div className="mt-3 divide-y divide-slate-100">
              {messages.map((m) => (
                <div key={m.preview} className="flex gap-3 py-3">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${m.unread ? "bg-teal-600" : "bg-slate-200"}`} />
                  <div className="min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900">{m.from}</p>
                      <p className="shrink-0 text-xs text-slate-400">{formatDate(m.date)}</p>
                    </div>
                    <p className="truncate text-xs text-slate-500">{m.preview}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-2 text-sm font-semibold text-teal-700 hover:text-teal-800">
              Open inbox →
            </button>
          </section>

          {/* Documents */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">Documents & photos</h2>
            <div className="mt-3 divide-y divide-slate-100">
              {documents.map((d) => (
                <div key={d.name} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{d.name}</p>
                    <p className="text-xs text-slate-400">{d.size} · {formatDate(d.date)}</p>
                  </div>
                  <button className="shrink-0 text-xs font-semibold text-teal-700 hover:text-teal-800">
                    View
                  </button>
                </div>
              ))}
            </div>
            <button className="mt-3 w-full rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50">
              + Upload document or photo
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
