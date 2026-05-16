import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Construction,
  CreditCard,
  FileText,
} from "lucide-react";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cases } from "@/lib/db/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth-buttons";

export const dynamic = "force-dynamic";

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { caseId } = await params;

  const [caseRow] = await db
    .select()
    .from(cases)
    .where(
      session.user.isAdmin
        ? eq(cases.id, caseId)
        : and(eq(cases.id, caseId), eq(cases.userId, session.user.id))!
    )
    .limit(1);

  if (!caseRow) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-lg"
          >
            <Shield className="h-6 w-6 text-blue-600" />
            <span>Bima Buddy</span>
          </Link>
          <SignOutButton />
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/triage">
            <ArrowLeft className="h-4 w-4" />
            <span className="ml-1">Back to my cases</span>
          </Link>
        </Button>

        {/* Case overview */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>{caseRow.insurer}</CardTitle>
                <CardDescription className="mt-1">
                  ₹{Number(caseRow.claimAmount).toLocaleString("en-IN")} · Rejected on{" "}
                  {caseRow.rejectionDate} ·{" "}
                  <span className="capitalize">{caseRow.claimType}</span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-500 text-xs uppercase tracking-wide">
                  Payment
                </div>
                <div className="mt-1 font-medium capitalize">
                  {caseRow.paymentStatus === "paid" ? (
                    <span className="inline-flex items-center gap-1 text-green-700">
                      <CheckCircle2 className="h-4 w-4" /> Paid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-700">
                      <AlertTriangle className="h-4 w-4" /> Unpaid
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-slate-500 text-xs uppercase tracking-wide">
                  AI verdict
                </div>
                <div className="mt-1 font-medium capitalize">
                  {caseRow.aiStatus === "done" ? (
                    <span className="text-green-700">Ready</span>
                  ) : caseRow.aiStatus === "processing" ? (
                    <span className="inline-flex items-center gap-1 text-blue-700">
                      <Clock className="h-4 w-4" /> Processing
                    </span>
                  ) : (
                    <span className="text-slate-600">{caseRow.aiStatus}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Rejection letter: {caseRow.rejectionDocPath ? "✓" : "—"}
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Policy: {caseRow.policyDocPath ? "✓" : "—"}
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Bills: {caseRow.billsDocPath ? "✓" : "— (optional)"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment / next-step card */}
        {caseRow.paymentStatus === "unpaid" && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Awaiting payment</CardTitle>
                  <CardDescription className="mt-1">
                    Razorpay integration arriving Day 4+. For now, message us
                    on WhatsApp with your case ID and we&apos;ll send a payment
                    link.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md bg-slate-50 border border-slate-200 p-3 text-xs">
                <div className="text-slate-500 uppercase tracking-wide">
                  Case ID
                </div>
                <div className="font-mono mt-1 text-slate-900 break-all">
                  {caseRow.id}
                </div>
              </div>
              <Button asChild className="w-full mt-3" size="lg">
                <a
                  href={`https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent(
                    `Hi, I want to pay ₹199 for case ${caseRow.id}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp us to pay ₹199
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        {caseRow.paymentStatus === "paid" && caseRow.aiStatus === "pending" && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <Construction className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>AI verdict coming Day 4</CardTitle>
                  <CardDescription className="mt-1">
                    Payment confirmed. We&apos;ll process your case as soon as
                    the AI triage pipeline ships.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {session.user.isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-slate-600">
                Admin actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AdminPayButton
                caseId={caseRow.id}
                currentStatus={caseRow.paymentStatus}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

// Client-island button for the admin "mark as paid" action
function AdminPayButton({
  caseId,
  currentStatus,
}: {
  caseId: string;
  currentStatus: string;
}) {
  if (currentStatus === "paid") {
    return (
      <div className="text-sm text-slate-600">
        Already marked paid.
      </div>
    );
  }
  return <MarkPaidButton caseId={caseId} />;
}

// Tiny client component for the action
function MarkPaidButton({ caseId }: { caseId: string }) {
  return (
    <form
      action={`/api/cases/${caseId}/pay`}
      method="post"
      onSubmit={() => {}}
    >
      <Button type="submit" variant="outline" size="sm">
        Mark as paid
      </Button>
    </form>
  );
}
