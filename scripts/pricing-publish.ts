import { readFile } from "node:fs/promises";
import { Pool } from "pg";

type PricingUpdate = {
  serviceId: string;
  baselinePrice: number;
  priceUnit: string;
  marketRange: string;
  priceBasis: string;
  sources: Array<{ label: string; url: string }>;
  lastVerified?: string;
  publishedBy: string;
};

const file = process.argv[2];
if (!file) throw new Error("Usage: npm run pricing:publish -- path/to/reviewed-update.json");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required.");

const update = JSON.parse(await readFile(file, "utf8")) as PricingUpdate;
if (
  !update.serviceId ||
  !Number.isFinite(update.baselinePrice) ||
  update.baselinePrice < 0 ||
  !update.priceUnit ||
  !update.marketRange ||
  !update.priceBasis ||
  !update.publishedBy ||
  !Array.isArray(update.sources) ||
  update.sources.length === 0 ||
  update.sources.some((source) => !source.label || !URL.canParse(source.url))
) {
  throw new Error("The reviewed pricing update is incomplete or invalid.");
}

const pool = new Pool({ connectionString });
const client = await pool.connect();

try {
  await client.query("BEGIN");
  const previous = await client.query(
    "SELECT * FROM pricing_catalog WHERE service_id = $1 FOR UPDATE",
    [update.serviceId],
  );

  const published = await client.query(
    `
      INSERT INTO pricing_catalog (
        service_id, baseline_price, price_unit, market_range, price_basis,
        sources, last_verified, published_at, published_by
      )
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, NOW(), $8)
      ON CONFLICT (service_id) DO UPDATE SET
        baseline_price = EXCLUDED.baseline_price,
        price_unit = EXCLUDED.price_unit,
        market_range = EXCLUDED.market_range,
        price_basis = EXCLUDED.price_basis,
        sources = EXCLUDED.sources,
        last_verified = EXCLUDED.last_verified,
        published_at = NOW(),
        published_by = EXCLUDED.published_by
      RETURNING *
    `,
    [
      update.serviceId,
      update.baselinePrice,
      update.priceUnit,
      update.marketRange,
      update.priceBasis,
      JSON.stringify(update.sources),
      update.lastVerified ?? new Date().toISOString().slice(0, 10),
      update.publishedBy,
    ],
  );

  await client.query(
    `
      INSERT INTO pricing_publications (
        service_id, published_by, previous_record, published_record
      )
      VALUES ($1, $2, $3::jsonb, $4::jsonb)
    `,
    [
      update.serviceId,
      update.publishedBy,
      previous.rowCount ? JSON.stringify(previous.rows[0]) : null,
      JSON.stringify(published.rows[0]),
    ],
  );
  await client.query("COMMIT");
  console.log(`Published reviewed pricing for ${update.serviceId}.`);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await pool.end();
}
