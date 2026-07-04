import { createHash, randomBytes, randomUUID } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { getPool } from "@/lib/db";
import {
  roleHasPermission,
  type EmployeeRole,
  type Permission,
} from "@/lib/permissions";

const sessionCookie = "baseline_staff_session";
const sessionLifetimeMs = 8 * 60 * 60 * 1000;

export type CurrentEmployee = {
  id: string;
  fullName: string;
  email: string;
  role: EmployeeRole;
  team: string | null;
};

function pool() {
  const value = getPool();
  if (!value) throw new Error("Employee authentication requires PostgreSQL.");
  return value;
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function authenticateEmployee(email: string, password: string) {
  const result = await pool().query(
    `SELECT * FROM employees WHERE email = LOWER($1) LIMIT 1`,
    [email],
  );
  const row = result.rows[0];
  const now = new Date();

  if (
    !row ||
    row.status !== "active" ||
    (row.locked_until && new Date(row.locked_until) > now) ||
    !(await bcrypt.compare(password, row.password_hash))
  ) {
    if (row?.status === "active") {
      const attempts = Number(row.failed_login_attempts) + 1;
      await pool().query(
        `
          UPDATE employees
          SET failed_login_attempts = $2,
              locked_until = CASE WHEN $2 >= 5 THEN NOW() + INTERVAL '15 minutes' ELSE locked_until END,
              updated_at = NOW()
          WHERE id = $1
        `,
        [row.id, attempts],
      );
    }
    return null;
  }

  await pool().query(
    `
      UPDATE employees
      SET failed_login_attempts = 0, locked_until = NULL, last_login_at = NOW(), updated_at = NOW()
      WHERE id = $1
    `,
    [row.id],
  );
  return { id: String(row.id) };
}

export async function createEmployeeSession(employeeId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + sessionLifetimeMs);
  await pool().query(
    `
      INSERT INTO employee_sessions (id, employee_id, token_hash, expires_at)
      VALUES ($1, $2, $3, $4)
    `,
    [randomUUID(), employeeId, hashToken(token), expiresAt],
  );
  (await cookies()).set(sessionCookie, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroyEmployeeSession() {
  const store = await cookies();
  const token = store.get(sessionCookie)?.value;
  if (token) {
    await pool().query("DELETE FROM employee_sessions WHERE token_hash = $1", [hashToken(token)]);
  }
  store.delete(sessionCookie);
}

export async function changeEmployeePassword(
  employeeId: string,
  currentPassword: string,
  newPassword: string,
) {
  const result = await pool().query(
    "SELECT password_hash FROM employees WHERE id = $1 AND status = 'active'",
    [employeeId],
  );
  if (!result.rowCount || !(await bcrypt.compare(currentPassword, result.rows[0].password_hash))) {
    return false;
  }

  const client = await pool().connect();
  try {
    await client.query("BEGIN");
    await client.query(
      "UPDATE employees SET password_hash = $2, updated_at = NOW() WHERE id = $1",
      [employeeId, await bcrypt.hash(newPassword, 12)],
    );
    await client.query(
      "DELETE FROM employee_sessions WHERE employee_id = $1",
      [employeeId],
    );
    await client.query(
      `
        INSERT INTO employee_audit_log (
          actor_employee_id, action, subject_type, subject_id
        )
        VALUES ($1, 'employee.password_changed', 'employee', $1)
      `,
      [employeeId],
    );
    await client.query("COMMIT");
    (await cookies()).delete(sessionCookie);
    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export const getCurrentEmployee = cache(async (): Promise<CurrentEmployee | null> => {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return null;

  const result = await pool().query(
    `
      SELECT e.id, e.full_name, e.email, e.role, e.team
      FROM employee_sessions s
      JOIN employees e ON e.id = s.employee_id
      WHERE s.token_hash = $1
        AND s.expires_at > NOW()
        AND e.status = 'active'
      LIMIT 1
    `,
    [hashToken(token)],
  );
  if (!result.rowCount) return null;
  const row = result.rows[0];
  return {
    id: String(row.id),
    fullName: String(row.full_name),
    email: String(row.email),
    role: row.role as EmployeeRole,
    team: row.team ? String(row.team) : null,
  };
});

export async function requireEmployee(permission: Permission = "admin.access") {
  const employee = await getCurrentEmployee();
  if (!employee) redirect("/staff/login");
  if (!roleHasPermission(employee.role, permission)) redirect("/admin?denied=1");
  return employee;
}
