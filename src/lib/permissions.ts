export const employeeRoles = [
  "owner",
  "administrator",
  "operations_manager",
  "applicant_reviewer",
  "project_manager",
  "pricing_analyst",
  "finance",
  "support",
  "auditor",
] as const;

export type EmployeeRole = (typeof employeeRoles)[number];

export const permissions = [
  "admin.access",
  "employees.view",
  "employees.manage",
  "employees.assign_owner",
  "applicants.view",
  "applicants.manage",
  "providers.manage",
  "projects.view",
  "projects.manage",
  "pricing.view",
  "pricing.publish",
  "finance.view",
  "finance.manage",
  "support.manage",
  "audit.view",
] as const;

export type Permission = (typeof permissions)[number];

const allPermissions = new Set<Permission>(permissions);

export const rolePermissions: Record<EmployeeRole, ReadonlySet<Permission>> = {
  owner: allPermissions,
  administrator: new Set(permissions.filter((permission) => permission !== "employees.assign_owner")),
  operations_manager: new Set([
    "admin.access", "employees.view", "applicants.view", "applicants.manage",
    "providers.manage", "projects.view", "projects.manage", "pricing.view",
    "support.manage", "audit.view",
  ]),
  applicant_reviewer: new Set(["admin.access", "applicants.view", "applicants.manage"]),
  project_manager: new Set(["admin.access", "providers.manage", "projects.view", "projects.manage", "support.manage"]),
  pricing_analyst: new Set(["admin.access", "pricing.view", "pricing.publish"]),
  finance: new Set(["admin.access", "projects.view", "finance.view", "finance.manage"]),
  support: new Set(["admin.access", "applicants.view", "projects.view", "support.manage"]),
  auditor: new Set([
    "admin.access", "employees.view", "applicants.view", "projects.view",
    "pricing.view", "finance.view", "audit.view",
  ]),
};

export const roleLabels: Record<EmployeeRole, string> = {
  owner: "Owner",
  administrator: "Administrator",
  operations_manager: "Operations Manager",
  applicant_reviewer: "Applicant Reviewer",
  project_manager: "Project Manager",
  pricing_analyst: "Pricing Analyst",
  finance: "Finance",
  support: "Support",
  auditor: "Read-only Auditor",
};

export function roleHasPermission(role: EmployeeRole, permission: Permission) {
  return rolePermissions[role].has(permission);
}
