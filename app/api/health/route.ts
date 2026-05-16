import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const startedAt = Date.now();
  try {
    const result = await db.execute(sql`SELECT 1 AS ok`);
    return NextResponse.json({
      status: "ok",
      db: "connected",
      latency_ms: Date.now() - startedAt,
      result: result[0],
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: "fail",
        db: "unreachable",
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
