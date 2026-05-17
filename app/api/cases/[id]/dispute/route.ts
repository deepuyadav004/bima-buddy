import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cases } from "@/lib/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  disputeStatus: z.enum(["not_started", "filed", "won", "lost", "withdrawn"]),
  amountRecovered: z
    .union([z.number().nonnegative(), z.null()])
    .optional()
    .nullable(),
});

// ============================================================
// POST /api/cases/[id]/dispute — admin updates dispute outcome
// ============================================================
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { id } = await ctx.params;
  let parsed;
  try {
    parsed = BodySchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid body" },
      { status: 400 }
    );
  }

  const update: {
    disputeStatus: string;
    amountRecovered: string | null;
    updatedAt: Date;
  } = {
    disputeStatus: parsed.disputeStatus,
    amountRecovered:
      parsed.amountRecovered != null ? String(parsed.amountRecovered) : null,
    updatedAt: new Date(),
  };

  const [updated] = await db
    .update(cases)
    .set(update)
    .where(eq(cases.id, id))
    .returning({
      id: cases.id,
      disputeStatus: cases.disputeStatus,
      amountRecovered: cases.amountRecovered,
    });

  if (!updated) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, case: updated });
}
