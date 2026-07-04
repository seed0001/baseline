import { createHash } from "node:crypto";
import { Pool } from "pg";
import { services } from "../src/lib/data";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required.");

const pool = new Pool({ connectionString });
const run = await pool.query<{ id: string }>(
  "INSERT INTO pricing_refresh_runs DEFAULT VALUES RETURNING id",
);
const runId = run.rows[0].id;

const pricePattern = /(?:\$|USD\s?)\d[\d,]*(?:\.\d{1,2})?(?:\s*(?:-|–|to)\s*(?:\$|USD\s?)?\d[\d,]*(?:\.\d{1,2})?)?/gi;
let sourcesChecked = 0;
let sourcesChanged = 0;
let sourcesFailed = 0;

async function checkSource(serviceId: string, label: string, url: string) {
  let httpStatus: number | null = null;
  let contentHash: string | null = null;
  let changed = false;
  let observedPrices: string[] = [];
  let errorMessage: string | null = null;

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
      headers: {
        "User-Agent": "BaselinePricingMonitor/1.0",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    httpStatus = response.status;
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();
    const normalized = html.replace(/\s+/g, " ").trim();
    contentHash = createHash("sha256").update(normalized).digest("hex");
    observedPrices = [...new Set(normalized.match(pricePattern) ?? [])].slice(0, 100);

    const previous = await pool.query<{ content_hash: string | null }>(
      `
        SELECT content_hash
        FROM pricing_source_checks
        WHERE service_id = $1 AND source_url = $2 AND content_hash IS NOT NULL
        ORDER BY checked_at DESC
        LIMIT 1
      `,
      [serviceId, url],
    );
    changed = previous.rowCount === 1 && previous.rows[0].content_hash !== contentHash;
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : String(error);
    sourcesFailed += 1;
  }

  if (changed) sourcesChanged += 1;
  sourcesChecked += 1;

  await pool.query(
    `
      INSERT INTO pricing_source_checks (
        run_id, service_id, source_label, source_url, http_status, content_hash,
        content_changed, observed_prices, error_message
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)
    `,
    [
      runId,
      serviceId,
      label,
      url,
      httpStatus,
      contentHash,
      changed,
      JSON.stringify(observedPrices),
      errorMessage,
    ],
  );
}

try {
  for (const service of services) {
    await Promise.all(
      service.sources.map((source) => checkSource(service.id, source.label, source.url)),
    );
  }

  await pool.query(
    `
      UPDATE pricing_refresh_runs
      SET finished_at = NOW(), status = 'completed', services_checked = $2,
          sources_checked = $3, sources_changed = $4, sources_failed = $5
      WHERE id = $1
    `,
    [runId, services.length, sourcesChecked, sourcesChanged, sourcesFailed],
  );

  console.log(
    `Pricing refresh ${runId}: ${services.length} services, ${sourcesChecked} sources, ` +
      `${sourcesChanged} changed, ${sourcesFailed} failed. Review required before publication.`,
  );
} catch (error) {
  await pool.query(
    `
      UPDATE pricing_refresh_runs
      SET finished_at = NOW(), status = 'failed', error_message = $2
      WHERE id = $1
    `,
    [runId, error instanceof Error ? error.message : String(error)],
  );
  throw error;
} finally {
  await pool.end();
}
