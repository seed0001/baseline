import Link from "next/link";
import type { Metadata } from "next";
import { categories, formatCurrency, formatDate } from "@/lib/data";
import { getCatalogServices } from "@/lib/catalog";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "How We Price — Baseline Pricing Methodology & Sources",
  description:
    "Every Baseline price is compiled from independent, published cost guides. See the market range, methodology, and linked sources behind each catalog service.",
};

export const dynamic = "force-dynamic";

const methodologySteps = [
  {
    title: "Compile independent cost guides",
    body: "For every catalog service we pull current published pricing from independent industry sources — national cost databases (Angi, HomeAdvisor, HomeGuide, Fixr), trade publications, and specialist pricing guides for software, creative, professional, and event services. Each service cites its sources below.",
  },
  {
    title: "Set the baseline at the qualified mid-market",
    body: "The baseline is not the cheapest number we can find. It reflects the middle of the market for a licensed, insured, screened provider doing the job correctly — the price a well-informed customer should expect, not a teaser rate.",
  },
  {
    title: "Adjust for region",
    body: "Published national figures are adjusted with regional multipliers (labor cost index, demand, travel) at quote time. Onsite services reflect Greater Austin; digital and professional services use national market rates.",
  },
  {
    title: "Calibrate against completed Baseline jobs",
    body: "As projects complete on the platform, actual accepted-quote and final-invoice data feeds back into the baseline. Where our completed-job data diverges from published guides, we adjust and note it.",
  },
  {
    title: "Re-verify quarterly",
    body: "Each service shows a “last verified” date. Sources are re-checked and baselines re-published at least quarterly, or sooner when a market moves (e.g., material costs, AV labor rates).",
  },
];

export default async function MethodologyPage() {
  const services = await getCatalogServices();
  const grouped = categories
    .filter((c) => c.id !== "custom")
    .map((c) => ({
      category: c,
      items: services.filter((s) => s.categoryId === c.id),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="How We Price"
        description="Baseline prices aren't guesses and they aren't bids. Every number in the catalog is compiled from independent, published market data — and we show our work."
      />

      {/* Methodology */}
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">The methodology</h2>
        <ol className="mt-6 space-y-6">
          {methodologySteps.map((s, i) => (
            <li key={s.title} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">
                {i + 1}
              </span>
              <div>
                <h3 className="font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-6 rounded-lg bg-slate-50 p-4 text-xs text-slate-500">
          Baseline prices are reference averages, not quotes. Your firm quote reflects your specific
          scope, site conditions, and region, and is honored once accepted. External sources are
          cited for transparency; Baseline is not affiliated with the publishers.
        </p>
      </section>

      {/* Per-service data */}
      <section className="mt-12">
        <h2 className="text-lg font-semibold text-slate-900">Source data by service</h2>
        <p className="mt-1 text-sm text-slate-600">
          Every catalog service, its current baseline, the published market range, and the sources it
          was compiled from.
        </p>

        <div className="mt-6 space-y-10">
          {grouped.map(({ category, items }) => (
            <div key={category.id}>
              <h3 className="border-b border-slate-200 pb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                {category.name}
              </h3>
              <div className="mt-4 space-y-4">
                {items.map((s) => (
                  <article
                    key={s.id}
                    id={s.id}
                    className="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h4 className="font-semibold text-slate-900">{s.name}</h4>
                      <p className="text-sm text-slate-500">
                        Baseline:{" "}
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(s.baselinePrice)}
                        </span>{" "}
                        <span className="text-xs">{s.priceUnit}</span>
                      </p>
                    </div>
                    <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Published market range
                        </dt>
                        <dd className="mt-0.5 text-slate-700">{s.marketRange}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          How the baseline was set
                        </dt>
                        <dd className="mt-0.5 text-slate-700">{s.priceBasis}</dd>
                      </div>
                    </dl>
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-slate-100 pt-3 text-xs">
                      <span className="font-medium uppercase tracking-wide text-slate-400">Sources:</span>
                      {s.sources.map((src) => (
                        <a
                          key={src.url}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-teal-700 underline decoration-teal-300 underline-offset-2 hover:text-teal-800"
                        >
                          {src.label} ↗
                        </a>
                      ))}
                      <span className="ml-auto text-slate-400">
                        Last verified {formatDate(s.lastVerified)}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-12 rounded-xl bg-teal-900 p-8 text-center">
        <h2 className="text-xl font-semibold text-white">See a number that looks off?</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-teal-100">
          Market data moves. If you have a recent quote or source that disagrees with a baseline,
          send it through a custom request and our catalog team will review it.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/services" className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-teal-900 hover:bg-teal-50">
            Browse the Catalog
          </Link>
          <Link href="/quote" className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/40 hover:bg-white/10">
            Get a Quote
          </Link>
          <Link href="/custom-request" className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/40 hover:bg-white/10">
            Submit Pricing Feedback
          </Link>
        </div>
      </div>
    </div>
  );
}
