import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, projects, providers, formatCurrency, formatDate } from "@/lib/data";
import { Badge, ProgressBar, StatCard } from "@/components/ui";

export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();

  const assigned = providers.filter((p) => project.providerIds.includes(p.id));
  const overallPct = Math.round(
    project.milestones.reduce((s, m) => s + m.completion, 0) / project.milestones.length
  );
  const escrow = project.payments
    .filter((p) => p.status === "In Escrow")
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/dashboard" className="text-sm font-medium text-teal-700 hover:text-teal-800">
        ← Back to dashboard
      </Link>

      {/* Overview header */}
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{project.name}</h1>
            <Badge label={project.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {project.id} · {project.location} · {formatDate(project.startDate)} → {formatDate(project.targetDate)}
          </p>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">{project.description}</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
            Message Team
          </button>
          <button className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
            Request Change
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Budget" value={formatCurrency(project.budget)} sub="Approved proposal total" />
        <StatCard label="Paid to date" value={formatCurrency(project.paidToDate)} sub={`${formatCurrency(escrow)} currently in escrow`} />
        <StatCard label="Overall progress" value={`${overallPct}%`} sub={`${project.milestones.filter((m) => m.status === "Complete").length} of ${project.milestones.length} milestones complete`} />
        <StatCard label="Target completion" value={formatDate(project.targetDate)} sub="On schedule" />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          {/* Milestones */}
          <section>
            <h2 className="text-lg font-semibold text-slate-900">Milestones</h2>
            <div className="mt-4 space-y-4">
              {project.milestones.map((m) => (
                <div key={m.id} className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{m.name}</p>
                      <p className="mt-1 text-sm text-slate-600">{m.description}</p>
                    </div>
                    <Badge label={m.status} />
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-slate-400">Due date</p>
                      <p className="text-sm font-medium text-slate-900">{formatDate(m.dueDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Amount</p>
                      <p className="text-sm font-medium text-slate-900">{formatCurrency(m.amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Payment</p>
                      <Badge label={m.paymentStatus} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Completion</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <ProgressBar value={m.completion} />
                        <span className="text-xs font-medium text-slate-600">{m.completion}%</span>
                      </div>
                    </div>
                  </div>
                  {m.status === "In Progress" && m.paymentStatus === "In Escrow" && (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-amber-50 p-3 ring-1 ring-inset ring-amber-600/20">
                      <p className="text-sm text-amber-800">
                        When this milestone is finished, you&apos;ll review the work and release{" "}
                        <span className="font-semibold">{formatCurrency(m.amount)}</span> from escrow.
                      </p>
                      <div className="flex gap-2">
                        <button className="rounded-md bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-800">
                          Approve & Release Payment
                        </button>
                        <button className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
                          Flag an Issue
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Tasks */}
          <section>
            <h2 className="text-lg font-semibold text-slate-900">Tasks</h2>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Task</th>
                    <th className="px-4 py-3">Milestone</th>
                    <th className="px-4 py-3">Assignee</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {project.tasks.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{t.name}</td>
                      <td className="px-4 py-3 text-slate-600">{t.milestone}</td>
                      <td className="px-4 py-3 text-slate-600">{t.assignee}</td>
                      <td className="px-4 py-3"><Badge label={t.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Change requests */}
          <section>
            <h2 className="text-lg font-semibold text-slate-900">Change requests</h2>
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-6">
              <p className="text-sm text-slate-600">
                Need to adjust scope, materials, or timeline? Change requests are quoted and require
                your written approval before any work proceeds — your project total updates only after
                you accept.
              </p>
              <button className="mt-4 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
                + Submit a Change Request
              </button>
            </div>
          </section>

          {/* Activity feed */}
          <section>
            <h2 className="text-lg font-semibold text-slate-900">Activity</h2>
            <ol className="mt-4 space-y-0 rounded-xl border border-slate-200 bg-white p-5">
              {project.activity.map((a, i) => (
                <li key={a.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < project.activity.length - 1 && (
                    <span className="absolute left-[5px] top-4 h-full w-px bg-slate-200" />
                  )}
                  <span className="relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2 border-white bg-teal-600 ring-1 ring-slate-200" />
                  <div>
                    <p className="text-sm text-slate-800">
                      <span className="font-semibold">{a.actor}</span> — {a.action}
                    </p>
                    <p className="text-xs text-slate-400">{formatDate(a.date)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Assigned providers */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">Assigned providers</h2>
            <div className="mt-3 divide-y divide-slate-100">
              {assigned.map((p) => (
                <div key={p.id} className="flex items-center gap-3 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                    {p.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">{p.name}</p>
                    <p className="truncate text-xs text-slate-500">
                      {p.company} · ★ {p.rating.toFixed(1)} · {p.jobsCompleted} jobs
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              All providers are Baseline-screened and approved for the services on this project.
            </p>
          </section>

          {/* Payment schedule */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">Payment schedule</h2>
            <div className="mt-3 divide-y divide-slate-100">
              {project.payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{p.label}</p>
                    <p className="text-xs text-slate-400">Due {formatDate(p.dueDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{formatCurrency(p.amount)}</p>
                    <Badge label={p.status} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-sm">
              <span className="font-semibold text-slate-900">Total</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(project.payments.reduce((s, p) => s + p.amount, 0))}
              </span>
            </div>
          </section>

          {/* Approvals */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">Customer approvals</h2>
            <p className="mt-2 text-sm text-slate-600">
              Approving a milestone releases its escrowed payment. Approvals are final — flag an issue
              first if anything looks wrong.
            </p>
            <div className="mt-4 space-y-2">
              <button className="w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800">
                Approve Current Milestone
              </button>
              <button className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
                Request Revision
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
