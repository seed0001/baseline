import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET() {
  try {
    const pool = getPool();
    if (pool) await pool.query("SELECT 1");

    return NextResponse.json({
      status: "ok",
      database: pool ? "connected" : "not-configured",
    });
  } catch {
    return NextResponse.json(
      { status: "error", database: "unavailable" },
      { status: 503 },
    );
  }
}
