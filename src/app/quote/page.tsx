import { getCatalogService, getCatalogServices } from "@/lib/catalog";
import { PageHeader } from "@/components/ui";
import { QuoteBuilder } from "./quote-builder";

export const metadata = {
  title: "Quote Builder — Baseline",
};

export const dynamic = "force-dynamic";

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;
  const services = await getCatalogServices();
  const selected = await getCatalogService(service);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Request a Quote"
        description="Answer the required questions for your service and we'll return a quote range built from baseline pricing. A firm proposal follows within one business day."
      />
      <div className="mt-8">
        <QuoteBuilder services={services} initialServiceId={selected?.id ?? null} />
      </div>
    </div>
  );
}
