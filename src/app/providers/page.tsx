import Link from "next/link";
import { categories } from "@/lib/data";
import { ButtonLink, PageHeader } from "@/components/ui";
import { ProviderApplicationForm } from "./provider-application-form";

export const metadata = {
  title: "Become a Provider — Baseline",
};

const screeningSteps = [
  {
    title: "Application review",
    body: "Business details, field experience, and the catalog services you want to fulfill — trades, software, creative, professional, or events.",
    time: "1–2 business days",
  },
  {
    title: "Credentials & insurance verification",
    body: "State licensing and bonding where required (trades, CPA, catering), liability coverage, and portfolio or work-sample review for digital, creative, and professional services.",
    time: "2–4 business days",
  },
  {
    title: "Background check",
    body: "Identity and criminal background screening for anyone who enters a customer's property or handles customer data and financials.",
    time: "3–5 business days",
  },
  {
    title: "Skill qualification",
    body: "Per-service approval — a licensed plumber may qualify for water heaters but not remodels; a dev studio for web apps but not mobile. You only see jobs you're approved for.",
    time: "Varies by field",
  },
];

export default function ProvidersPage() {
  const applicationFields = categories
    .filter((category) => category.id !== "custom")
    .map(({ id, name }) => ({ id, name }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Become a Baseline Provider"
        description="Baseline providers don't chase leads or bid against each other. Get matched to pre-scoped jobs from our company-owned catalog."
        action={
          <ButtonLink href="/providers/portal" variant="secondary">
            Already approved? Open Provider Portal →
          </ButtonLink>
        }
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div className="space-y-10">
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">How fulfillment works</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex gap-3">
                <span className="font-semibold text-teal-700">1.</span>
                You apply and pass screening — once, not per job.
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-teal-700">2.</span>
                <span>
                  You opt into services from Baseline&apos;s master catalog that you&apos;re
                  qualified to perform.{" "}
                  <span className="font-medium text-slate-900">You never create your own listings.</span>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-teal-700">3.</span>
                Job invitations arrive with scope, photos, and pricing already set. Accept or
                decline — no penalty for declining.
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-teal-700">4.</span>
                Payment terms and milestone timing are disclosed before you accept a job.
              </li>
            </ul>
          </section>

          <section id="screening" className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Screening requirements</h2>
            <p className="mt-1 text-sm text-slate-500">
              Every provider completes all four stages before their first job.
            </p>
            <ol className="mt-5 space-y-5">
              {screeningSteps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h3 className="font-semibold text-slate-900">{step.title}</h3>
                      <span className="text-xs text-slate-400">{step.time}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section className="h-fit rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Provider application</h2>
          <p className="mt-1 text-sm text-slate-500">
            Takes about 10 minutes. Most applicants hear back within 2 business days.
          </p>
          <ProviderApplicationForm fields={applicationFields} />
          <p className="mt-4 text-xs text-slate-400">
            After approval you&apos;ll choose the specific catalog services you&apos;re qualified
            to fulfill. Baseline owns and maintains all service listings.{" "}
            <Link href="/services" className="font-medium text-teal-700 hover:text-teal-800">
              Preview the catalog →
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
