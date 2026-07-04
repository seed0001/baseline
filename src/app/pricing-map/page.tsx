import type { Metadata } from "next";
import Link from "next/link";
import { getCatalogServices } from "@/lib/catalog";
import { ButtonLink, SectionHeading } from "@/components/ui";
import { RegionalHeatMap } from "./regional-heat-map";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Regional Pricing Map — Baseline",
  description:
    "See how service pricing varies state by state, and how traveling providers can quote work outside their home region.",
};

const travelSteps = [
  {
    title: "Open your quote to travelers",
    body: "When you request a quote, choose to invite qualified providers from other states who are willing to travel for the work.",
  },
  {
    title: "Travel costs are itemized",
    body: "A traveling provider's bid shows the same benchmarked service price for your region, with mileage, lodging, and logistics as separate line items — never buried in the rate.",
  },
  {
    title: "Compare local vs. traveling",
    body: "You see both totals side by side. For specialized work, a traveling expert with travel costs can still beat a local generalist's price — and you'll see exactly why.",
  },
];

const travelingSpecialists = [
  {
    company: "Summit AV Integrations",
    base: "Denver, CO",
    coverage: "Travels nationwide",
    specialty: "Commercial audio-visual build-outs",
    policy: "Airfare + lodging itemized · no travel charge over $25k project value",
  },
  {
    company: "Statewide Epoxy Systems",
    base: "Fort Worth, TX",
    coverage: "TX, OK, LA, NM, AR",
    specialty: "Industrial epoxy flooring",
    policy: "$0.70/mi from home base · lodging at cost for multi-day jobs",
  },
  {
    company: "Coastal Timber Frame Co.",
    base: "Asheville, NC",
    coverage: "Eastern U.S.",
    specialty: "Custom timber frame structures",
    policy: "Flat travel fee quoted per project · crew per-diem itemized",
  },
];

export default async function PricingMapPage() {
  const services = await getCatalogServices();
  const sampleIds = ["svc-101", "svc-610", "svc-901"];
  const sampleServices = services
    .filter((s) => sampleIds.includes(s.id))
    .map((s) => ({ id: s.id, name: s.name, baselinePrice: s.baselinePrice, priceUnit: s.priceUnit }));

  return (
    <>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Regional Pricing"
            title="What the same job costs, state by state"
            description="Every Baseline benchmark starts from the national qualified mid-market, then adjusts to the job's region using published labor-cost and cost-of-living indices. Select a state to see its index and example baselines."
          />
          <div className="mt-10">
            <RegionalHeatMap sampleServices={sampleServices} />
          </div>
          <p className="mt-6 text-sm text-slate-500">
            Indices are compiled from the same independent, published sources as our national
            benchmarks — see{" "}
            <Link href="/methodology" className="font-medium text-teal-700 hover:text-teal-800">
              how we price
            </Link>{" "}
            for the full methodology.
          </p>
        </div>
      </section>

      {/* Traveling providers */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Traveling Providers"
          title="The right specialist, even from out of state"
          description="Some work deserves the best person for the job, not just the closest one. Providers can mark themselves willing to travel, and customers can open their quotes to them — with travel costs always broken out transparently."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {travelSteps.map((s, i) => (
            <div key={s.title} className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">
            Traveling specialists on Baseline
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {travelingSpecialists.map((p) => (
              <div key={p.company} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-semibold text-slate-900">{p.company}</h4>
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20 whitespace-nowrap">
                    Travels
                  </span>
                </div>
                <p className="mt-1 text-sm text-teal-700">{p.specialty}</p>
                <dl className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Home base</dt>
                    <dd className="font-medium text-slate-900">{p.base}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Coverage</dt>
                    <dd className="text-right font-medium text-slate-900">{p.coverage}</dd>
                  </div>
                </dl>
                <p className="mt-3 border-t border-slate-200 pt-3 text-xs text-slate-500">{p.policy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Get a quote priced for your region
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-slate-600">
            Pick a service, set your state, and choose whether to invite traveling providers.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/quote">Start a Quote</ButtonLink>
            <ButtonLink href="/methodology" variant="secondary">How We Price</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
