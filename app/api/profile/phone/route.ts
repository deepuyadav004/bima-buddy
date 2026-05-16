import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  // E.164 format Indian number: +91 + 10 digits starting 6-9
  phone: z.string().regex(/^\+91[6-9]\d{9}$/, "Invalid Indian mobile number"),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  // Check phone uniqueness across other users
  const existing = await db.query.users.findFirst({
    where: eq(users.phone, parsed.data.phone),
    columns: { id: true },
  });
  if (existing && existing.id !== session.user.id) {
    return NextResponse.json(
      { error: "This phone number is already registered" },
      { status: 409 }
    );
  }

  await db
    .update(users)
    .set({ phone: parsed.data.phone })
    .where(eq(users.id, session.user.id));

  return NextResponse.json({ ok: true });
}
