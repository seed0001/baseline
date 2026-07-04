import { getPool } from "@/lib/db";
import {
  services as researchedCatalog,
  type PriceSource,
  type ServiceTemplate,
} from "@/lib/data";

type PricingRow = {
  service_id: string;
  baseline_price: string;
  price_unit: string;
  market_range: string;
  price_basis: string;
  sources: PriceSource[];
  last_verified: Date | string;
};

export async function getCatalogServices(): Promise<ServiceTemplate[]> {
  const pool = getPool();
  if (!pool) return researchedCatalog;

  try {
    const result = await pool.query<PricingRow>(`
      SELECT service_id, baseline_price, price_unit, market_range, price_basis,
             sources, last_verified
      FROM pricing_catalog
    `);

    const published = new Map(result.rows.map((row) => [row.service_id, row]));

    return researchedCatalog.map((service) => {
      const row = published.get(service.id);
      if (!row) return service;

      const verified =
        row.last_verified instanceof Date
          ? row.last_verified.toISOString().slice(0, 10)
          : String(row.last_verified).slice(0, 10);

      return {
        ...service,
        baselinePrice: Number(row.baseline_price),
        priceUnit: row.price_unit,
        marketRange: row.market_range,
        priceBasis: row.price_basis,
        sources: row.sources,
        lastVerified: verified,
      };
    });
  } catch (error) {
    if (process.env.REQUIRE_DATABASE === "true") throw error;
    console.error("Pricing database unavailable; using the last researched catalog snapshot.", error);
    return researchedCatalog;
  }
}

export async function getCatalogService(id: string | undefined) {
  if (!id) return undefined;
  return (await getCatalogServices()).find((service) => service.id === id);
}
