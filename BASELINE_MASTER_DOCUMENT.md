# Baseline — Master Document

**Transparent pricing. Managed projects.**

This is the single source of truth for what Baseline is, the business it describes, how the
platform works end to end, and where the implementation currently stands. Companion documents
cover specific operations: [PRICING_OPERATIONS.md](PRICING_OPERATIONS.md),
[PROVIDER_OPERATIONS.md](PROVIDER_OPERATIONS.md), [EMPLOYEE_ACCESS.md](EMPLOYEE_ACCESS.md).

---

## 1. What Baseline is

Baseline is a **managed service catalog and project quoting platform**. It covers every kind of
service a customer might buy — trades and home repair, commercial construction, software and app
development, creative and design, marketing, professional services (bookkeeping, tax), events and
catering, automotive, cleaning, moving — from a $55 lawn mow to a $60,000 software build.

Two decisions define the company and separate it from every marketplace competitor:

1. **Baseline owns the catalog.** Providers do not create listings. The company defines every
   service, its scope, its required information, and its price. Providers apply, pass screening,
   and opt into catalog services they are qualified to fulfill.

2. **Every price is evidence-backed.** Each catalog service carries a baseline average price
   compiled from independent, published market data (Angi, HomeAdvisor, HomeGuide, Fixr, industry
   pricing guides for software/creative/professional work), with the market range, the derivation
   method, linked sources, and a last-verified date published openly at `/methodology`.

The product promise to the customer: *you always know what fair looks like before anyone quotes
you.* The promise to the provider: *pre-scoped, pre-funded jobs with no bidding wars.*

## 2. The problem

- **Customers have no trusted reference point for service pricing.** Marketplaces show whatever
  providers claim; lead-gen sites sell your phone number; quotes vary 3× for identical work with
  no way to tell which is fair.
- **Marketplaces are listing chaos.** Open platforms let anyone post anything, pushing the burden
  of vetting quality, scope, and price onto the customer.
- **Large projects lack structure.** A remodel, a software build, or an office build-out involves
  phases, approvals, and staged payments — which typically live in email threads, texts, and
  trust. Disputes have no paper trail.

## 3. The Baseline model

### The catalog (company-owned)

- 41 services across 14 categories at launch, each a **ServiceTemplate** defining: name, category,
  description, baseline price + unit (flat / per axle / per person / per month / starting at),
  estimated duration, required skill level (Entry → Intermediate → Licensed Pro → Specialist),
  photo/measurement requirements, and the exact information a customer must provide.
- Prices are **published with receipts**: market range, derivation note, cited sources, and
  verification date, all visible at `/methodology`.
- The catalog grows through **custom requests**: a customer describes work we don't list, an
  operator reviews it, and approved requests can be promoted into new catalog services.

### The lifecycle: quote → proposal → project

Everything the company sells moves through one pipeline, regardless of size:

```text
Catalog service (or custom request)
  → QuoteRequest      customer answers required questions, uploads photos,
                      gets an instant estimate range off the baseline
  → Proposal          firm, phase-based line items with qty/unit/price,
                      tax, deposit, payment terms, acceptance signature
  → Project           milestones, tasks, assigned providers, payment
                      schedule, change requests, activity feed
  → Milestone approvals → escrow releases → completion & sign-off
```

**A small job and a large project are the same object.** A toilet replacement is a project with
three milestones (remove, install, test & sign-off). A bathroom remodel is five phases. A custom
inventory-management system is six phases delivered in two-week sprints with demo-acceptance
gates. One data model, one UI, one payment structure.

### Money flow (escrow by milestone)

1. Customer accepts a proposal and pays the deposit (e.g. 10%).
2. Each phase is funded into escrow **before work begins**.
3. Provider completes the phase; customer reviews and approves.
4. Approval releases the escrowed payment; providers are paid within 2 business days.
5. Disputes freeze escrow for that phase until an operator resolves the case.
6. Change requests are estimated, approved in writing, and appended to the payment schedule.

### The provider network (screened, not self-listed)

Four-stage screening, run once per provider (pipeline detail in
[PROVIDER_OPERATIONS.md](PROVIDER_OPERATIONS.md)):

1. **Application review** — business details, field experience, requested services.
2. **Credentials & insurance** — licensing/bonding where required (trades, CPA, catering);
   portfolio review for digital, creative, and professional services.
3. **Background check** — anyone entering a customer's property or handling customer data.
4. **Skill qualification** — approval is *per catalog service*, not blanket. A plumber may
   qualify for water heaters but not remodels; a dev studio for web apps but not mobile.

Approved providers opt into services, receive matched job invitations (scope, photos, and payout
already fixed), and accept or decline with no penalty. Performance (rating, on-time arrival,
first-visit completion, rework rate) gates access to priority work.

### Revenue model (intended)

- **Take rate on managed volume** — the spread between the customer price and the provider
  payout (visible in the data: e.g. a $340 toilet job pays the provider $272 ≈ 20%).
- Future levers: recurring-service subscriptions, deposit float, financing referrals, and
  priority placement for top-rated providers. None of these compromise the catalog's neutrality —
  providers cannot pay to alter pricing or listings.

## 4. The three users and their surfaces

| User | Surfaces | What they do |
|---|---|---|
| **Customer** | `/` landing, `/services` catalog, `/quote` builder, `/custom-request`, `/proposals/[id]`, `/dashboard`, `/projects/[id]`, `/methodology` | Browse evidence-backed prices, request quotes, accept proposals, approve milestones, release payments, request changes |
| **Provider** | `/providers` (apply + screening requirements), `/providers/portal` (invitations, qualifications, earnings, performance) | Apply once, opt into qualified services, accept/decline funded jobs, track payouts |
| **Staff / Operator** | `/staff/login`, `/staff/account`, `/admin` (catalog & baseline price management, regional adjustments), `/admin/applicants` (screening queue), `/admin/employees` | Maintain the catalog, publish pricing, screen providers, manage quotes/projects/disputes, administer employee access |

## 5. Pricing methodology (the moat)

Full detail lives at `/methodology` on the site and in
[PRICING_OPERATIONS.md](PRICING_OPERATIONS.md). Summary:

1. **Compile** independent published cost guides per service (three cited sources typical).
2. **Set the baseline at the qualified mid-market** — the fair price for licensed, insured,
   screened work, not a teaser rate.
3. **Adjust for region** via multipliers at quote time (onsite = Greater Austin at launch;
   digital/professional services priced nationally).
4. **Calibrate** against actual accepted-quote and final-invoice data from completed Baseline jobs.
5. **Re-verify quarterly**, with per-service last-verified dates published.

Production hardening (already built): the live site serves only **approved** rows from the
`pricing_catalog` table in PostgreSQL. A refresh job checks every cited URL (HTTP status, content
hash, observed figures) into `pricing_source_checks`; a human reviews diffs; publication via
`pricing:publish` records before/after values in `pricing_publications`. Monitoring is
deliberately separated from publishing so a source-page redesign can never silently change a
customer-facing price. `src/lib/data.ts` holds the researched snapshot and serves as the
local-development fallback.

## 6. Data model

Core entities (defined in `src/lib/data.ts`, served through `src/lib/catalog.ts`):

- **ServiceCategory** — 14 categories + Custom Requests.
- **ServiceTemplate** — the catalog unit, including `marketRange`, `priceBasis`, `sources[]`,
  `lastVerified`.
- **QuoteRequest** — service, customer, location, urgency, status
  (Submitted → Under Review → Quoted → Accepted / Expired), estimate range.
- **Proposal** — prepared-for block, scope, phase-based line items (qty / unit / unit price),
  tax rate, deposit %, payment terms, acceptance.
- **Project** — status, budget, paid-to-date, dates, milestones, tasks, provider assignments,
  payment schedule, activity feed.
- **Milestone** — description, status (Not Started → In Progress → Awaiting Approval → Complete),
  due date, amount, payment status (Not Due / Due / In Escrow / Paid), completion %.
- **Task** — milestone-scoped work items with assignees.
- **Provider / ProviderQualification** — company, trade, rating, jobs completed, screening
  status, per-service qualifications.
- **PaymentSchedule** — mirrors milestones; escrow states.
- **CustomServiceRequest** — description, budget range, timeline, review status; promotable to a
  catalog template.

Production tables (see `db/migrations/`): `pricing_catalog`, `pricing_source_checks`,
`pricing_publications` (001); provider applications with full status-event audit trail and an
`operations_notifications` outbox (002); employees, roles/permissions, and hashed-token sessions
(003).

## 7. Architecture & stack

- **Framework**: Next.js 16 (App Router, RSC), React 19, Tailwind CSS v4, TypeScript.
- **Data**: PostgreSQL via `pg` (`src/lib/db.ts`); graceful fallback to the bundled researched
  catalog when `DATABASE_URL` is absent (local dev). Zod for validation.
- **Auth (staff)**: individual employee accounts, bcrypt password hashing, opaque session tokens
  stored as SHA-256 hashes, 8-hour expiry, immediate revocation on suspension. Nine roles from
  Owner to Read-only Auditor ([EMPLOYEE_ACCESS.md](EMPLOYEE_ACCESS.md)).
- **Deployment**: Railway (`railway.json`), standalone Next build, `/api/health` endpoint that
  fails when PostgreSQL is unavailable in production.
- **Scripts**: `db:migrate`, `pricing:seed`, `pricing:refresh`, `pricing:publish`,
  `employee:bootstrap`.

## 8. Implementation status

**Working today**

- Full public site: landing, catalog with search/category filters, quote builder with live
  estimate ranges, proposal views (small job, remodel, software build), customer dashboard,
  project detail with milestones/tasks/payments/activity, provider application + portal, custom
  request flow, pricing methodology page with cited sources.
- Researched pricing for all 41 priced services (latest additions verified 2026-07-04) with published ranges and
  source links.
- Production pricing pipeline (Postgres-backed, auditable publication).
- Provider application intake with reference numbers, operator review queue, status pipeline with
  full event history.
- Employee access system with roles, permissions, and secure sessions; admin surfaces for
  applicants and employees.

**Still placeholder / mock**

- Customer accounts and authentication (dashboard shows sample data for a demo customer).
- Payments and escrow (statuses modeled end to end; no processor integration).
- Messaging, document upload, notifications delivery (outbox exists; no email/SMS worker yet).
- Quotes/proposals/projects are seeded sample data, not yet database-backed.
- Regional pricing multipliers are displayed but not applied computationally.

**Suggested next milestones**

1. Customer auth + persist quote requests to Postgres (the intake side of the funnel).
2. Payment processor + real escrow states on milestones.
3. Notification worker draining `operations_notifications` (email/SMS).
4. Proposal generation from quote requests in the operator console.
5. Provider-side job invitation flow backed by real assignments.

## 9. Design principles

- Clean, neutral SaaS interface; slate palette with a single teal accent; desktop-first,
  responsive.
- Credible, realistic content everywhere — real market figures, real dates, plausible names; no
  lorem ipsum.
- The same UI must make sense to a homeowner, a contractor, and an operations analyst.
- Show the work: pricing sources, verification dates, audit trails, and status history are
  features, not internals.
