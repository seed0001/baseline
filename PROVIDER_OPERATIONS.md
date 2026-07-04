# Provider application operations

Provider applications are submitted from `/providers` and stored in PostgreSQL.
Applicants receive a `BPA-YYYY-XXXXXX` reference immediately after a successful
transaction.

Operations staff review applications at `/admin/applicants`. That route and all
status mutations require an active employee session with the
`applicants.view` or `applicants.manage` permission.

## Pipeline

Applications can move through:

```text
New → Under review → Information requested → Credentials
    → Background check → Skill review → Approved
```

Declined and withdrawn are terminal alternatives. Every status change stores its
previous status, new status, operator, timestamp, and internal note in
`provider_application_events`.

Each new submission also creates a pending `operations_notifications` record in
the same transaction. This is the outbox for the later email/SMS notification
worker; the application appears in the protected operations queue immediately.

## Railway deployment

`npm run db:migrate` now applies every numbered SQL migration, including the
provider application tables. It already runs as the Railway pre-deploy command.

Required production variables:

```text
DATABASE_URL=${{Postgres.DATABASE_URL}}
REQUIRE_DATABASE=true
OWNER_NAME=<owner name>
OWNER_EMAIL=<owner work email>
OWNER_PASSWORD=<long random secret>
```

After the first deployment, run `npm run employee:bootstrap` once in Railway to
create the initial owner account. The owner then creates individual employee
accounts from `/admin/employees`.
