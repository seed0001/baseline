import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { getPool } from "@/lib/db";
import type { EmployeeRole } from "@/lib/permissions";

export type EmployeeStatus = "active" | "suspended" | "terminated";

export type EmployeeRecord = {
  id: string;
  fullName: string;
  email: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  team: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
};

function pool() {
  const value = getPool();
  if (!value) throw new Error("Employee management requires PostgreSQL.");
  return value;
}

function mapEmployee(row: Record<string, unknown>): EmployeeRecord {
  return {
    id: String(row.id),
    fullName: String(row.full_name),
    email: String(row.email),
    role: row.role as EmployeeRole,
    status: row.status as EmployeeStatus,
    team: row.team ? String(row.team) : null,
    lastLoginAt: row.last_login_at ? new Date(String(row.last_login_at)) : null,
    createdAt: new Date(String(row.created_at)),
  };
}

export async function listEmployees() {
  const result = await pool().query(
    "SELECT * FROM employees ORDER BY status, full_name",
  );
  return result.rows.map(mapEmployee);
}

export async function getEmployee(id: string) {
  const result = await pool().query("SELECT * FROM employees WHERE id = $1 LIMIT 1", [id]);
  return result.rowCount ? mapEmployee(result.rows[0]) : null;
}

export async function createEmployee(input: {
  fullName: string;
  email: string;
  password: string;
  role: EmployeeRole;
  team: string;
  actorId: string;
}) {
  const client = await pool().connect();
  const id = randomUUID();
  try {
    await client.query("BEGIN");
    await client.query(
      `
        INSERT INTO employees (id, full_name, email, password_hash, role, team)
        VALUES ($1, $2, LOWER($3), $4, $5, NULLIF($6, ''))
      `,
      [id, input.fullName, input.email, await bcrypt.hash(input.password, 12), input.role, input.team],
    );
    await client.query(
      `
        INSERT INTO employee_audit_log (
          actor_employee_id, action, subject_type, subject_id, metadata
        )
        VALUES ($1, 'employee.created', 'employee', $2, $3::jsonb)
      `,
      [input.actorId, id, JSON.stringify({ role: input.role, email: input.email.toLowerCase() })],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateEmployee(input: {
  id: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  team: string;
  actorId: string;
}) {
  const client = await pool().connect();
  try {
    await client.query("BEGIN");
    const current = await client.query(
      "SELECT role, status FROM employees WHERE id = $1 FOR UPDATE",
      [input.id],
    );
    if (!current.rowCount) throw new Error("Employee not found.");

    await client.query(
      `
        UPDATE employees
        SET role = $2, status = $3, team = NULLIF($4, ''), updated_at = NOW()
        WHERE id = $1
      `,
      [input.id, input.role, input.status, input.team],
    );
    if (input.status !== "active") {
      await client.query("DELETE FROM employee_sessions WHERE employee_id = $1", [input.id]);
    }
    await client.query(
      `
        INSERT INTO employee_audit_log (
          actor_employee_id, action, subject_type, subject_id, metadata
        )
        VALUES ($1, 'employee.updated', 'employee', $2, $3::jsonb)
      `,
      [
        input.actorId,
        input.id,
        JSON.stringify({
          from: current.rows[0],
          to: { role: input.role, status: input.status, team: input.team || null },
        }),
      ],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
