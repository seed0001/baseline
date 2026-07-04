import { customRequests, formatDate } from "@/lib/data";
import { Badge, PageHeader } from "@/components/ui";
import { CustomRequestForm } from "./custom-request-form";

export const metadata = {
  title: "Custom Request — Baseline",
};

export default function CustomRequestPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Submit a Custom Request"
        description="Can't find your service in the catalog? Describe the work and our team will review it, price it, and match a qualified provider."
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CustomRequestForm />
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-teal-200 bg-teal-50 p-5">
            <h2 className="font-semibold text-teal-900">How custom requests work</h2>
            <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-teal-800">
              <li>You describe the job, budget, and timeline.</li>
              <li>Baseline reviews it — usually within 2 business days.</li>
              <li>If we can fulfill it, you get a scoped quote from a screened provider.</li>
            </ol>
            <p className="mt-4 border-t border-teal-200 pt-3 text-sm font-medium text-teal-900">
              If approved, this request may become a new Baseline catalog service — with a baseline
              price available to everyone.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">Recently submitted requests</h2>
            <div className="mt-3 divide-y divide-slate-100">
              {customRequests.map((c) => (
                <div key={c.id} className="py-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900">{c.title}</p>
                    <Badge label={c.status} />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {c.id} · {c.location} · {formatDate(c.submittedDate)}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              “Koi pond cleaning” was approved and is being added to the Lawn &amp; Property category.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
