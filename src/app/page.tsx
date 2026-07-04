import Link from "next/link";
import { categories, formatCurrency } from "@/lib/data";
import { getCatalogServices } from "@/lib/catalog";
import { Badge, ButtonLink, SectionHeading } from "@/components/ui";

export const dynamic = "force-dynamic";

const steps = [
  {
    title: "Browse the catalog",
    body: "Every service has a baseline average price, expected time, and exactly what info we need — no mystery pricing.",
  },
  {
    title: "Request a quote",
    body: "Answer a few required questions, add photos, and get a firm quote range built from real regional data.",
  },
  {
    title: "Approve the proposal",
    body: "Your quote becomes a phase-based proposal with line items, payment schedule, and clear terms.",
  },
  {
    title: "We manage the project",
    body: "Screened providers do the work. You approve each milestone before payment is released from escrow.",
  },
];

const customerBenefits = [
  { title: "Know the price before you call", body: "Baseline averages for every service, adjusted for your region — see the number before anyone visits." },
  { title: "Screened, not self-listed", body: "Providers can't invent listings. They're vetted, then approved for specific catalog services only." },
  { title: "Pay by milestone", body: "Funds sit in escrow and release only when you approve the work. Small job or big remodel, same protection." },
  { title: "One platform, start to finish", body: "Quotes, proposals, schedules, change requests, and messages in one place — no text-message chaos." },
];

const providerBenefits = [
  { title: "No bidding wars", body: "Baseline pricing means you're matched on qualification, not on who quotes lowest." },
  { title: "Pre-qualified jobs", body: "Every job arrives with photos, measurements, and scope already collected. Show up ready to work." },
  { title: "Guaranteed milestone payouts", body: "Customer funds are escrowed before you start a phase. Approved work gets paid, on schedule." },
  { title: "Grow your qualifications", body: "Opt into more catalog services as you're approved. More qualifications, more invitations." },
];

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
                Onsite services in Greater Austin · Digital & professional services nationwide
              </p>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                Transparent pricing.
                <br />
                <span className="text-teal-700">Managed projects.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-slate-600">
                Baseline owns a curated catalog covering every kind of service — trades, software,
                creative, professional, events, and more. Each has a baseline price, expected time,
                and screened providers. A one-visit repair or a six-phase build: you always know what
                fair looks like.
              </p>

              {/* Search */}
              <form action="/services" className="mt-8 flex max-w-xl gap-2">
                <input
                  type="search"
                  name="q"
                  placeholder="Search services — “web app”, “catering”, “bookkeeping”, “remodel”…"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
                >
                  Search
                </button>
              </form>

              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href="/quote">Get a Quote</ButtonLink>
                <ButtonLink href="/services" variant="secondary">Browse Services</ButtonLink>
                <ButtonLink href="/providers" variant="ghost">Become a Provider →</ButtonLink>
              </div>
            </div>

            {/* Example project preview card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Live project preview</p>
                  <h3 className="mt-1 font-semibold text-slate-900">Bathroom Remodel — Master Bath</h3>
                </div>
                <Badge label="In Progress" />
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { name: "Phase 1 — Planning & Measurements", pct: 100 },
                  { name: "Phase 2 — Demolition", pct: 100 },
                  { name: "Phase 3 — Rough Plumbing & Electrical", pct: 65 },
                  { name: "Phase 4 — Walls, Flooring & Tile", pct: 0 },
                  { name: "Phase 5 — Fixture Install & Walkthrough", pct: 0 },
                ].map((m) => (
                  <div key={m.name} className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800">{m.name}</p>
                      <span className="text-xs text-slate-400">{m.pct}%</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
                      <div className="h-1.5 rounded-full bg-teal-600" style={{ width: `${m.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 text-sm">
                <span className="text-slate-500">Budget</span>
                <span className="font-semibold text-slate-900">$12,400 · $4,960 paid via escrow</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <Link href="/projects/PRJ-2041" className="font-semibold text-teal-700 hover:text-teal-800">
                  View full project detail →
                </Link>
                <Link href="/projects/PRJ-2047" className="text-slate-500 hover:text-teal-700">
                  Also live: Inventory Management System ($38.4k software build) →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The Catalog"
          title="One trusted catalog, owned by Baseline"
          description="Providers don't create listings. Baseline defines every service, its fair price, and its requirements — providers qualify to fulfill them."
        />
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
                    {c.serviceCount} services
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-slate-600">{c.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="How It Works"
            title="From quote to sign-off in four steps"
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
        </div>
      </section>

      {/* Featured services */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Popular Services" title="Know the baseline before you book" />
          <ButtonLink href="/services" variant="secondary">View full catalog</ButtonLink>
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
              <p className="mt-1 text-xs text-slate-500">Est. {s.estimatedDuration} · {s.skillLevel}</p>
              <Link
                href={`/quote?service=${s.id}`}
                className="mt-4 inline-block text-sm font-semibold text-teal-700 hover:text-teal-800"
              >
                Request quote →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2">
            <div>
              <SectionHeading eyebrow="For Customers" title="A trusted starting point for every job" />
              <dl className="mt-8 space-y-6">
                {customerBenefits.map((b) => (
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
            </div>
            <div>
              <SectionHeading eyebrow="For Providers" title="Better jobs, without the race to the bottom" />
              <dl className="mt-8 space-y-6">
                {providerBenefits.map((b) => (
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
              <div className="mt-8">
                <ButtonLink href="/providers">Apply to become a provider</ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-teal-900">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Ready to see what your project should cost?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-teal-100">
            Get a baseline-backed quote in minutes. No sales calls, no obligations.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/quote" className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-teal-900 hover:bg-teal-50">
              Get a Quote
            </Link>
            <Link href="/services" className="rounded-lg px-5 py-3 text-sm font-semibold text-white ring-1 ring-inset ring-white/40 hover:bg-white/10">
              Browse Services
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
