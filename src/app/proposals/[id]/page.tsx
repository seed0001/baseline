import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProposal, proposals, proposalTotals, formatCurrency, formatDate } from "@/lib/data";

export function generateStaticParams() {
  return proposals.map((p) => ({ id: p.id }));
}

export default async function ProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const proposal = getProposal(id);
  if (!proposal) notFound();

  const { base, tax, total, deposit } = proposalTotals(proposal);
  const other = proposals.find((p) => p.id !== proposal.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard" className="text-sm font-medium text-teal-700 hover:text-teal-800">
          ← Back to dashboard
        </Link>
        {other && (
          <Link href={`/proposals/${other.id}`} className="text-sm text-slate-500 hover:text-teal-700">
            View proposal: {other.projectName} →
          </Link>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Company header */}
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-200 bg-slate-900 px-8 py-8">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-sm font-bold text-white">
                B
              </span>
              <span className="text-xl font-semibold tracking-tight text-white">Baseline Services, Inc.</span>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              1200 Congress Ave, Suite 400 · Austin, TX 78701 · (512) 555-0100
            </p>
          </div>
          <div className="text-sm text-slate-300">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Project Proposal</p>
            <p className="mt-1 font-mono text-lg font-semibold text-white">{proposal.id}</p>
            <p className="mt-2">Date: <span className="text-white">{formatDate(proposal.date)}</span></p>
            <p>Valid until: <span className="text-white">{formatDate(proposal.validUntil)}</span></p>
          </div>
        </div>

        <div className="px-8 py-8">
          {/* Prepared for + scope */}
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Prepared for</h2>
              <p className="mt-2 font-semibold text-slate-900">{proposal.preparedFor.name}</p>
              <p className="text-sm text-slate-600">{proposal.preparedFor.address}</p>
              <p className="text-sm text-slate-600">{proposal.preparedFor.email}</p>
              <p className="text-sm text-slate-600">{proposal.preparedFor.phone}</p>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Project</h2>
              <p className="mt-2 font-semibold text-slate-900">{proposal.projectName}</p>
              <h2 className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Scope of work</h2>
              <p className="mt-2 text-sm text-slate-600">{proposal.scope}</p>
            </div>
          </div>

          {/* Line items by phase */}
          <div className="mt-10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-900 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-4">Description</th>
                  <th className="py-2 pr-4 text-right">Qty</th>
                  <th className="py-2 pr-4 text-right">Unit</th>
                  <th className="py-2 pr-4 text-right">Unit Price</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {proposal.phases.map((phase) => {
                  const phaseTotal = phase.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
                  return (
                    <Fragment key={phase.name}>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <td colSpan={4} className="py-2.5 pr-4 font-semibold text-slate-900">
                          {phase.name}
                        </td>
                        <td className="py-2.5 text-right font-semibold text-slate-900">
                          {formatCurrency(phaseTotal)}
                        </td>
                      </tr>
                      {phase.items.map((item) => (
                        <tr key={phase.name + item.description} className="border-b border-slate-100">
                          <td className="py-2.5 pr-4 pl-4 text-slate-600">{item.description}</td>
                          <td className="py-2.5 pr-4 text-right text-slate-600">{item.qty}</td>
                          <td className="py-2.5 pr-4 text-right text-slate-600">{item.unit}</td>
                          <td className="py-2.5 pr-4 text-right text-slate-600">{formatCurrency(item.unitPrice)}</td>
                          <td className="py-2.5 text-right text-slate-600">{formatCurrency(item.qty * item.unitPrice)}</td>
                        </tr>
                      ))}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>

            {/* Totals */}
            <div className="mt-6 ml-auto max-w-xs space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Base project total</span>
                <span className="font-medium text-slate-900">{formatCurrency(base)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tax ({(proposal.taxRate * 100).toFixed(2)}%)</span>
                <span className="font-medium text-slate-900">{formatCurrency(Math.round(tax))}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base">
                <span className="font-semibold text-slate-900">Project total</span>
                <span className="font-semibold text-slate-900">{formatCurrency(Math.round(total))}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-teal-50 px-3 py-2 ring-1 ring-inset ring-teal-600/20">
                <span className="font-semibold text-teal-900">
                  Deposit due at acceptance{proposal.depositPct > 0 ? ` (${proposal.depositPct * 100}%)` : ""}
                </span>
                <span className="font-semibold text-teal-900">{formatCurrency(Math.round(deposit))}</span>
              </div>
            </div>
          </div>

          {/* Payment terms */}
          <div className="mt-10 rounded-xl bg-slate-50 p-6">
            <h2 className="text-sm font-semibold text-slate-900">Payment terms</h2>
            <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-slate-600">
              {proposal.paymentTerms.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>

          {/* Acceptance */}
          <div className="mt-10 border-t border-slate-200 pt-8">
            <h2 className="text-sm font-semibold text-slate-900">Acceptance</h2>
            <p className="mt-2 text-sm text-slate-600">
              By accepting, you authorize Baseline Services, Inc. to schedule the work described above
              under the payment terms listed. Milestone payments are held in escrow and released only
              upon your approval.
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <div className="h-12 border-b border-slate-300" />
                <p className="mt-2 text-xs text-slate-500">Customer signature</p>
              </div>
              <div>
                <div className="h-12 border-b border-slate-300" />
                <p className="mt-2 text-xs text-slate-500">Date</p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <button className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800">
                Accept Proposal & Pay Deposit
              </button>
              <button className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
                Request Changes
              </button>
              <button className="rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700">
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
