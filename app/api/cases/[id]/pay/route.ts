import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cases } from "@/lib/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================
// POST /api/cases/[id]/pay — admin marks a case as paid (V0 manual payment)
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

  const [updated] = await db
    .update(cases)
    .set({ paymentStatus: "paid", updatedAt: new Date() })
    .where(eq(cases.id, id))
    .returning({
      id: cases.id,
      paymentStatus: cases.paymentStatus,
      aiStatus: cases.aiStatus,
    });

  if (!updated) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  // TODO Day 4: trigger AI triage processing here
  return NextResponse.json({ ok: true, case: updated });
}
