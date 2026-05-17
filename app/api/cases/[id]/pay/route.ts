import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cases } from "@/lib/db/schema";
import { processCase } from "@/lib/triage";
import { isExpired } from "@/lib/case-status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

// ============================================================
// POST /api/cases/[id]/pay — admin marks case as paid + kicks off AI triage
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

  // Block payment on expired cases
  const [existing] = await db
    .select({ expiresAt: cases.expiresAt })
    .from(cases)
    .where(eq(cases.id, id))
    .limit(1);
  if (!existing) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }
  if (isExpired(existing.expiresAt)) {
    return NextResponse.json(
      { error: "Case has expired (30-day window). User must submit a fresh triage." },
      { status: 410 }
    );
  }

  const [updated] = await db
    .update(cases)
    .set({ paymentStatus: "paid", updatedAt: new Date() })
    .where(eq(cases.id, id))
    .returning({
      id: cases.id,
      paymentStatus: cases.paymentStatus,
      aiStatus: cases.aiStatus,
    });

  // Kick off triage in background — don't await
  processCase({ caseId: id }).catch((err) => {
    console.error(`[pay] triage failed for case=${id}:`, err);
  });

  return NextResponse.json({ ok: true, case: updated });
}
