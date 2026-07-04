# Pricing data operations

Baseline serves approved pricing from PostgreSQL. The catalog bundled in
`src/lib/data.ts` is the initial researched snapshot and local-development
fallback; production uses `pricing_catalog`.

## Publication model

1. The live site reads only approved rows from `pricing_catalog`.
2. A quarterly refresh checks every cited URL and stores HTTP status, a content
   hash, and observed currency figures in `pricing_source_checks`.
3. Changed or failed sources are reviewed by a catalog operator.
4. A reviewed JSON update is published with `pricing:publish`. Every publication
   records its previous and new values in `pricing_publications`.
5. If a refresh fails, the last approved catalog remains live. Production is
   configured to fail its health check if PostgreSQL itself is unavailable.

This deliberately separates monitoring from publishing. A page redesign or an
out-of-context dollar figure cannot silently change a customer-facing price.

## Local commands

Set `DATABASE_URL`, then run:

```text
npm run db:migrate
npm run pricing:seed
npm run pricing:refresh
npm run pricing:publish -- reviewed-update.json
```

Copy `pricing-update.example.json` when preparing a reviewed publication. The
seed command never overwrites an existing published row.

## Railway setup

1. Add a PostgreSQL service to the Railway project.
2. On the web service set
   `DATABASE_URL=${{Postgres.DATABASE_URL}}` and `REQUIRE_DATABASE=true`.
3. Deploy the repository. `railway.json` runs migrations and the non-destructive
   initial seed before the web deployment, then checks `/api/health`.
4. Add a second service from the same repository named `pricing-refresh`.
5. Give it the same `DATABASE_URL`.
6. Set its custom start command to `npm run pricing:refresh`.
7. Set its Cron Schedule to `0 6 1 1,4,7,10 *` (06:00 UTC on the first day of
   January, April, July, and October).
8. Trigger the cron service once manually and confirm that its process exits and
   a completed row appears in `pricing_refresh_runs`.

Railway cron jobs must terminate when their work finishes. The refresh script
closes its database pool in all success and failure paths.

## Review query

Use this query to find the latest run’s exceptions:

```sql
SELECT service_id, source_label, source_url, http_status, content_changed,
       observed_prices, error_message
FROM pricing_source_checks
WHERE run_id = (SELECT MAX(id) FROM pricing_refresh_runs)
  AND (content_changed OR error_message IS NOT NULL)
ORDER BY service_id, source_label;
```

No refresh run changes `last_verified`. That date advances only when a reviewed
update is published.
