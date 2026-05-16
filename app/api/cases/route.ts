import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cases } from "@/lib/db/schema";
import { uploadFileToBlob, ensureContainer } from "@/lib/blob";
import { INDIAN_HEALTH_INSURERS } from "@/lib/insurers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REJECTION_MB = 10;
const MAX_POLICY_MB = 25;
const MAX_BILLS_MB = 25;
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

const InsurerEnum = z.enum(
  INDIAN_HEALTH_INSURERS as unknown as [string, ...string[]]
);

const CaseFields = z.object({
  insurer: InsurerEnum,
  claimAmount: z.coerce
    .number()
    .positive("Claim amount must be positive")
    .max(50000000),
  rejectionDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  claimType: z.enum(["cashless", "reimbursement"]),
});

function validateFile(
  file: File | null,
  kind: string,
  maxMb: number,
  required = true
) {
  if (!file || file.size === 0) {
    if (required) throw new Error(`${kind} is required`);
    return null;
  }
  if (file.size > maxMb * 1024 * 1024) {
    throw new Error(`${kind} must be under ${maxMb}MB`);
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`${kind} must be PDF / JPG / PNG`);
  }
  return file;
}

function fileExtension(file: File): string {
  const fromName = file.name.includes(".")
    ? file.name.split(".").pop()!.toLowerCase()
    : "";
  if (fromName) return fromName;
  if (file.type === "application/pdf") return "pdf";
  if (file.type.startsWith("image/jpeg")) return "jpg";
  if (file.type === "image/png") return "png";
  return "bin";
}

// ============================================================
// GET /api/cases — list cases for the logged-in user
// ============================================================
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const rows = await db
    .select({
      id: cases.id,
      insurer: cases.insurer,
      claimAmount: cases.claimAmount,
      rejectionDate: cases.rejectionDate,
      claimType: cases.claimType,
      paymentStatus: cases.paymentStatus,
      aiStatus: cases.aiStatus,
      disputeStatus: cases.disputeStatus,
      amountRecovered: cases.amountRecovered,
      createdAt: cases.createdAt,
    })
    .from(cases)
    .where(eq(cases.userId, session.user.id))
    .orderBy(desc(cases.createdAt));

  return NextResponse.json({ cases: rows });
}

// ============================================================
// POST /api/cases — create a new case + upload docs
// ============================================================
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const fieldsResult = CaseFields.safeParse({
    insurer: formData.get("insurer"),
    claimAmount: formData.get("claimAmount"),
    rejectionDate: formData.get("rejectionDate"),
    claimType: formData.get("claimType"),
  });
  if (!fieldsResult.success) {
    return NextResponse.json(
      { error: fieldsResult.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  let rejectionDoc: File | null;
  let policyDoc: File | null;
  let billsDoc: File | null;
  try {
    rejectionDoc = validateFile(
      formData.get("rejectionDoc") as File | null,
      "Rejection letter",
      MAX_REJECTION_MB
    );
    policyDoc = validateFile(
      formData.get("policyDoc") as File | null,
      "Policy document",
      MAX_POLICY_MB
    );
    billsDoc = validateFile(
      formData.get("billsDoc") as File | null,
      "Bills / discharge summary",
      MAX_BILLS_MB,
      false
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "File validation failed" },
      { status: 400 }
    );
  }

  await ensureContainer();
  const [created] = await db
    .insert(cases)
    .values({
      userId: session.user.id,
      insurer: fieldsResult.data.insurer,
      claimAmount: String(fieldsResult.data.claimAmount),
      rejectionDate: fieldsResult.data.rejectionDate,
      claimType: fieldsResult.data.claimType,
      paymentStatus: "unpaid",
      aiStatus: "pending",
    })
    .returning({ id: cases.id });

  const caseId = created.id;
  const userId = session.user.id;
  const ts = Date.now();

  try {
    const uploads = await Promise.all([
      uploadFileToBlob(
        rejectionDoc!,
        `${userId}/${caseId}/rejection-${ts}.${fileExtension(rejectionDoc!)}`
      ),
      uploadFileToBlob(
        policyDoc!,
        `${userId}/${caseId}/policy-${ts}.${fileExtension(policyDoc!)}`
      ),
      billsDoc
        ? uploadFileToBlob(
            billsDoc,
            `${userId}/${caseId}/bills-${ts}.${fileExtension(billsDoc)}`
          )
        : Promise.resolve(null),
    ]);

    await db
      .update(cases)
      .set({
        rejectionDocPath: uploads[0]!.blobPath,
        policyDocPath: uploads[1]!.blobPath,
        billsDocPath: uploads[2]?.blobPath ?? null,
        updatedAt: new Date(),
      })
      .where(eq(cases.id, caseId));

    return NextResponse.json({ caseId });
  } catch (err) {
    await db.delete(cases).where(eq(cases.id, caseId));
    return NextResponse.json(
      {
        error:
          "Upload failed. Please try again. " +
          (err instanceof Error ? err.message : ""),
      },
      { status: 500 }
    );
  }
}
