# Employee access and permissions

Baseline operations uses individual employee accounts backed by PostgreSQL.
Browser cookies contain only a random opaque session token; the database stores
its SHA-256 hash. Sessions expire after eight hours and are revoked immediately
when an employee is suspended or terminated.

## First owner

Set `OWNER_NAME`, `OWNER_EMAIL`, and a password of at least 12 characters as
Railway variables, then run:

```text
npm run employee:bootstrap
```

The bootstrap is non-destructive and never changes an existing account.

## Roles

- Owner: all permissions, including assigning other owners.
- Administrator: employee and operations administration, except assigning owners.
- Operations Manager: applicants, providers, projects, support, and oversight.
- Applicant Reviewer: provider application review.
- Project Manager: provider and project operations.
- Pricing Analyst: pricing review and publication.
- Finance: financial and project read access.
- Support: customer/provider support with limited read access.
- Read-only Auditor: reporting and audit access without mutations.

Every protected server action rechecks its required permission. Navigation
visibility is convenience only and is not treated as authorization.

## Account lifecycle

Owners and administrators create accounts at `/admin/employees`. Suspending or
terminating an employee deletes every active session in the same transaction.
Role, status, and team changes are written to `employee_audit_log`.
