import { Pool } from "pg";
import { services } from "../src/lib/data";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required.");

const pool = new Pool({ connectionString });

try {
  for (const service of services) {
    await pool.query(
      `
        INSERT INTO pricing_catalog (
          service_id, baseline_price, price_unit, market_range, price_basis,
          sources, last_verified, published_by
        )
        VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, 'initial-research')
        ON CONFLICT (service_id) DO NOTHING
      `,
      [
        service.id,
        service.baselinePrice,
        service.priceUnit,
        service.marketRange,
        service.priceBasis,
        JSON.stringify(service.sources),
        service.lastVerified,
      ],
    );
  }
  console.log(`Seeded ${services.length} researched services without overwriting published data.`);
} finally {
  await pool.end();
}
