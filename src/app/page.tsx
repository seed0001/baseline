import Link from "next/link";
import { categories, formatCurrency } from "@/lib/data";
import { getCatalogServices } from "@/lib/catalog";
import { ButtonLink, SectionHeading } from "@/components/ui";

export const dynamic = "force-dynamic";

const steps = [
  {
    title: "Build your catalog with AI",
    body: "Tell the assistant what you do. It drafts each service — scope, required info, photos, measurements — into a clean catalog page.",
  },
  {
    title: "Benchmark every price",
    body: "Each service is compared against national averages compiled from published cost guides, so you see exactly where you rank before you publish.",
  },
  {
    title: "Scope the job, send the bid",
    body: "Customers outline the job on your site. You turn it into a firm, phase-based quote with line items, terms, and a payment schedule.",
  },
  {
    title: "Get paid by milestone",
    body: "Work is broken into milestones, each funded before it starts. Customers approve, payments release, everyone gets notified by email.",
  },
];

const features = [
  {
    title: "AI catalog builder",
    body: "An assistant that interviews you about your services and drafts listings, scope requirements, and pricing — you approve every word.",
  },
  {
    title: "National price benchmarks",
    body: "Independent, published market data behind every price. See your position against the qualified mid-market, with sources cited.",
  },
  {
    title: "Job outlining & bids",
    body: "Structured intake collects photos, measurements, and answers up front, so every bid starts from a real scope — not a phone tag guess.",
  },
  {
    title: "Customer contact built in",
    body: "Messages, quote updates, and approvals live on the project — no lost texts, no email-thread archaeology.",
  },
  {
    title: "Email notifications",
    body: "Customers get notified when a quote arrives, a milestone needs approval, or a payment is due. You get notified when they act.",
  },
  {
    title: "Paid milestones",
    body: "Break any job into milestones with amounts attached. Each phase is funded before work begins and paid out on approval.",
  },
];

const businessBenefits = [
  { title: "A website without the website project", body: "Your catalog is a hosted, professional storefront from day one — no builder, no templates to fight." },
  { title: "Price with confidence", body: "Stop guessing what the market charges. Set prices knowing the national range and where you sit in it." },
  { title: "Quote faster, win more", body: "Structured job intake plus your catalog means bids go out in minutes with the scope already agreed." },
  { title: "Cash flow you can plan on", body: "Milestone funding means you never carry a whole job on your own money and chase the check at the end." },
];

const customerBenefits = [
  { title: "Evidence, not sales talk", body: "Every price on a Baseline catalog is shown next to the national market range, with sources anyone can check." },
  { title: "A real scope before a real price", body: "Structured intake means the quote reflects the actual job — fewer surprises, fewer change-order fights." },
  { title: "Pay as work completes", body: "Money is tied to milestones and released on approval. Small repair or long build, same protection." },
  { title: "Everything in one place", body: "Quotes, schedules, messages, and payment history on one project page — with email updates at every step." },
];

const heroBenchmarks = [
  { service: "Water Heater Replacement", yours: 1450, range: "$1,300 – $1,900", position: "At market", tone: "emerald" },
  { service: "Toilet Replacement", yours: 290, range: "$220 – $530", position: "Below average", tone: "blue" },
  { service: "Drain Cleaning", yours: 310, range: "$150 – $330", position: "Above average", tone: "amber" },
];

const positionTones: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
};

export default async function HomePage() {
  const services = await getCatalogServices();
  const featuredIds = ["svc-101", "svc-610", "svc-901", "svc-931"];
  const featured = services.filter((s) => featuredIds.includes(s.id));
  return (
    <>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-800 ring-1 ring-inset ring-teal-600/20">
                For service businesses — trades, creative, software, professional
              </p>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                Your services, your catalog.
                <br />
                <span className="text-teal-700">Priced with proof.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-slate-600">
                Baseline gives your business a hosted catalog website, an AI that helps you build
                and manage it, and national pricing data that shows customers your prices are fair.
                Outline jobs, send bids, keep customers in the loop, and get paid milestone by
                milestone — all in one place.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/providers">Apply for early access</ButtonLink>
                <ButtonLink href="/services" variant="secondary">Explore a live catalog</ButtonLink>
                <ButtonLink href="/methodology" variant="ghost">See the pricing data →</ButtonLink>
              </div>
            </div>

            {/* Catalog benchmark preview card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Catalog benchmark preview</p>
                  <h3 className="mt-1 font-semibold text-slate-900">Hill Country Plumbing — 11 services</h3>
                </div>
                <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700 ring-1 ring-inset ring-teal-600/20 whitespace-nowrap">
                  9 of 11 in range
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {heroBenchmarks.map((b) => (
                  <div key={b.service} className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800">{b.service}</p>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap ${positionTones[b.tone]}`}>
                        {b.position}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                      <span>
                        Your price <span className="font-semibold text-slate-900">{formatCurrency(b.yours)}</span>
                      </span>
                      <span>National range {b.range}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <p className="font-medium text-slate-800">Active job — Kitchen Repipe</p>
                  <span className="text-xs text-slate-400">Milestone 2 of 3</span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
                  <div className="h-1.5 rounded-full bg-teal-600" style={{ width: "55%" }} />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  $2,400 total · $960 paid · milestone 2 funded, awaiting approval
                </p>
              </div>
              <div className="mt-4 border-t border-slate-200 pt-4 text-sm">
                <Link href="/methodology" className="font-semibold text-teal-700 hover:text-teal-800">
                  How every benchmark is built →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How It Works"
          title="From “here's what I do” to paid milestones"
          description="One pipeline for every business — a lawn service, a dev studio, a caterer. Build the catalog, benchmark the prices, bid the jobs, get paid by phase."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title} className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Platform features */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="The Platform"
            title="A website, a catalog, and an AI to manage everything"
            description="Everything a service business needs to sell, scope, and deliver work — without stitching together five tools."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benchmark library */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="The Benchmark Library"
            title="National pricing data across every category"
            description="Every benchmark is compiled from independent, published cost guides — with the market range, the derivation method, and the sources listed openly."
          />
          <ButtonLink href="/methodology" variant="secondary">See the methodology</ButtonLink>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((s) => (
            <div key={s.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium text-teal-700">{s.category}</p>
              <h3 className="mt-1 font-semibold text-slate-900">{s.name}</h3>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                {formatCurrency(s.baselinePrice)}
                <span className="ml-1 text-xs font-normal text-slate-400">{s.priceUnit}</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">Market range {s.marketRange}</p>
              <p className="mt-1 text-xs text-slate-400">Verified {s.lastVerified}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={c.id === "custom" ? "/custom-request" : `/services?category=${c.id}`}
              className="group rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 group-hover:text-teal-700">{c.name}</h3>
                {c.serviceCount > 0 && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                    {c.serviceCount} benchmarks
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-slate-600">{c.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2">
            <div>
              <SectionHeading eyebrow="For Your Business" title="Run the whole job from one place" />
              <dl className="mt-8 space-y-6">
                {businessBenefits.map((b) => (
                  <div key={b.title} className="flex gap-4">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-600/20">
                      ✓
                    </span>
                    <div>
                      <dt className="font-semibold text-slate-900">{b.title}</dt>
                      <dd className="mt-1 text-sm text-slate-600">{b.body}</dd>
                    </div>
                  </div>
                ))}
              </dl>
              <div className="mt-8">
                <ButtonLink href="/providers">Apply for early access</ButtonLink>
              </div>
            </div>
            <div>
              <SectionHeading eyebrow="For Your Customers" title="The trust your quotes have been missing" />
              <dl className="mt-8 space-y-6">
                {customerBenefits.map((b) => (
                  <div key={b.title} className="flex gap-4">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-500/20">
                      ✓
                    </span>
                    <div>
                      <dt className="font-semibold text-slate-900">{b.title}</dt>
                      <dd className="mt-1 text-sm text-slate-600">{b.body}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-teal-900">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Give your business a catalog worth trusting
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-teal-100">
            A hosted website, an AI-built catalog, and national pricing data behind every number.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/providers" className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-teal-900 hover:bg-teal-50">
              Apply for early access
            </Link>
            <Link href="/methodology" className="rounded-lg px-5 py-3 text-sm font-semibold text-white ring-1 ring-inset ring-white/40 hover:bg-white/10">
              Explore the pricing data
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
