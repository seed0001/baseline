import Link from "next/link";
import { categories, formatCurrency } from "@/lib/data";
import { getCatalogServices } from "@/lib/catalog";
import { PageHeader } from "@/components/ui";

export const metadata = {
  title: "Service Catalog — Baseline",
};

export const dynamic = "force-dynamic";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const services = await getCatalogServices();
  const { q, category } = await searchParams;
  const query = (q ?? "").toLowerCase().trim();

  const filtered = services.filter((s) => {
    const matchesCategory = !category || s.categoryId === category;
    const matchesQuery =
      !query ||
      s.name.toLowerCase().includes(query) ||
      s.category.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  const activeCategory = categories.find((c) => c.id === category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Service Catalog"
        description="Every service below is defined, priced, and maintained by Baseline — from trades and construction to software, creative, professional services, and events. Providers are screened and approved per service. Onsite prices reflect Greater Austin averages; digital and professional services are delivered nationwide."
      />

      {/* Search + filters */}
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <form action="/services" className="flex max-w-md flex-1 gap-2">
          {category && <input type="hidden" name="category" value={category} />}
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search the catalog…"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Search
          </button>
        </form>
        <p className="text-sm text-slate-500">
          {filtered.length} of {services.length} services shown
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/services"
          className={`rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-inset transition-colors ${
            !category
              ? "bg-teal-700 text-white ring-teal-700"
              : "bg-white text-slate-600 ring-slate-300 hover:bg-slate-50"
          }`}
        >
          All
        </Link>
        {categories
          .filter((c) => c.id !== "custom")
          .map((c) => (
            <Link
              key={c.id}
              href={`/services?category=${c.id}`}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-inset transition-colors ${
                category === c.id
                  ? "bg-teal-700 text-white ring-teal-700"
                  : "bg-white text-slate-600 ring-slate-300 hover:bg-slate-50"
              }`}
            >
              {c.name}
            </Link>
          ))}
        <Link
          href="/custom-request"
          className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-teal-700 ring-1 ring-inset ring-teal-600/40 hover:bg-teal-50"
        >
          Custom Request →
        </Link>
      </div>

      {activeCategory && (
        <p className="mt-4 text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{activeCategory.name}:</span>{" "}
          {activeCategory.description}
        </p>
      )}

      {/* Service cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <div key={s.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-teal-700">{s.category}</p>
                <h3 className="mt-1 font-semibold text-slate-900">{s.name}</h3>
              </div>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 whitespace-nowrap">
                {s.skillLevel}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{s.description}</p>

            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold tracking-tight text-slate-900">
                {formatCurrency(s.baselinePrice)}
              </span>
              <span className="text-xs text-slate-400">{s.priceUnit} · baseline avg</span>
            </div>
            <Link
              href={`/methodology#${s.id}`}
              className="mt-1.5 text-xs font-medium text-teal-700 hover:text-teal-800 hover:underline"
            >
              See range, basis &amp; sources →
            </Link>

            <dl className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500">
              <div className="flex justify-between">
                <dt>Estimated duration</dt>
                <dd className="font-medium text-slate-700">{s.estimatedDuration}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Photos required</dt>
                <dd className="font-medium text-slate-700">{s.requiresPhotos ? "Yes" : "No"}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Measurements required</dt>
                <dd className="font-medium text-slate-700">{s.requiresMeasurements ? "Yes" : "No"}</dd>
              </div>
            </dl>

            <div className="mt-auto pt-4">
              <Link
                href={`/quote?service=${s.id}`}
                className="block w-full rounded-lg bg-teal-700 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-teal-800"
              >
                Request Quote
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-12 rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <h3 className="font-semibold text-slate-900">No services match your search</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            Can&apos;t find what you need? Submit a custom request — if approved, it may become a new
            Baseline catalog service.
          </p>
          <Link
            href="/custom-request"
            className="mt-4 inline-block rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Submit a Custom Request
          </Link>
        </div>
      )}
    </div>
  );
}
