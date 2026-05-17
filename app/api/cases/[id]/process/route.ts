import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cases } from "@/lib/db/schema";
import { processCase } from "@/lib/triage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // up to 5 min for OCR + LLM

// ============================================================
// POST /api/cases/[id]/process — manually (re)trigger AI triage
// Admin only.
// ============================================================
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { id } = await ctx.params;

  // Sanity check case exists
  const [c] = await db
    .select({ id: cases.id, paymentStatus: cases.paymentStatus })
    .from(cases)
    .where(eq(cases.id, id))
    .limit(1);
  if (!c) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  try {
    const verdict = await processCase({ caseId: id, force: true });
    return NextResponse.json({ ok: true, verdict });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
