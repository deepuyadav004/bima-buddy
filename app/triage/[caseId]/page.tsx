import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  FileText,
  Loader2,
  XCircle,
  Clock,
  Download,
} from "lucide-react";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cases } from "@/lib/db/schema";
import { getReadSasUrl } from "@/lib/blob";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth-buttons";
import { VerdictCard } from "@/components/verdict-card";
import { CasePoller } from "@/components/case-poller";
import { MarkPaidButton, ReTriggerAiButton } from "./admin-actions";
import type { Verdict } from "@/lib/triage";
import { VerdictSchema } from "@/lib/triage";
import { formatExpiryLabel, isExpired } from "@/lib/case-status";

export const dynamic = "force-dynamic";

interface VerdictWrapper {
  verdict?: unknown;
  error?: string;
  failedAt?: string;
  meta?: {
    modelDeployment?: string;
    promptVersion?: string;
    elapsedMs?: number;
    generatedAt?: string;
  };
}

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

  let verdict: Verdict | null = null;
  let aiError: string | null = null;
  const verdictWrapper = caseRow.verdictJson as VerdictWrapper | null;

  if (caseRow.aiStatus === "done" && verdictWrapper?.verdict) {
    const parsed = VerdictSchema.safeParse(verdictWrapper.verdict);
    if (parsed.success) {
      verdict = parsed.data;
    } else {
      aiError = "Verdict format invalid — please re-run AI.";
    }
  }

  if (caseRow.aiStatus === "failed") {
    aiError = verdictWrapper?.error ?? "AI processing failed.";
  }

  const showPoller =
    caseRow.aiStatus === "processing" || caseRow.aiStatus === "pending";

  return (
    <main className="min-h-screen bg-slate-50">
      {showPoller && caseRow.paymentStatus === "paid" && <CasePoller />}

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

        <Card>
          <CardHeader>
            <CardTitle>{caseRow.insurer}</CardTitle>
            <CardDescription className="mt-1">
              ₹{Number(caseRow.claimAmount).toLocaleString("en-IN")} · Rejected on{" "}
              {caseRow.rejectionDate} ·{" "}
              <span className="capitalize">{caseRow.claimType}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-500 text-xs uppercase tracking-wide">
                  Payment
                </div>
                <div className="mt-1 font-medium">
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
                  <AiStatusPill status={caseRow.aiStatus} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <DocumentsCard
          docs={[
            {
              label: "Rejection letter",
              path: caseRow.rejectionDocPath,
              required: true,
            },
            {
              label: "Policy document",
              path: caseRow.policyDocPath,
              required: true,
            },
            {
              label: "Hospital bills",
              path: caseRow.billsDocPath,
              required: false,
            },
          ]}
        />

        {caseRow.paymentStatus === "unpaid" && !isExpired(caseRow.expiresAt) && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Awaiting payment</CardTitle>
                  <CardDescription className="mt-1">
                    Email us for more information, payment, or any service
                    related questions. We&apos;ll get back to you within 24
                    hours.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" size="lg">
                <Link href={`/contact?caseId=${caseRow.id}`}>
                  Contact us to proceed
                </Link>
              </Button>
              <p className="mt-3 text-xs text-slate-500 text-center">
                {formatExpiryLabel(caseRow.expiresAt)} · After expiry,
                you&apos;ll need to start a fresh triage.
              </p>
            </CardContent>
          </Card>
        )}

        {isExpired(caseRow.expiresAt) && caseRow.paymentStatus === "unpaid" && (
          <Card className="border-slate-300 bg-slate-100/40">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-700">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-slate-800">
                    This case has expired
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Unpaid cases expire 30 days after submission. The documents
                    you uploaded are no longer eligible for processing.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" size="lg">
                <Link href="/triage">Start a fresh triage</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {caseRow.paymentStatus === "paid" &&
          (caseRow.aiStatus === "pending" ||
            caseRow.aiStatus === "processing") && (
            <Card className="border-blue-200 bg-blue-50/40">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                  <div>
                    <CardTitle className="text-blue-900">
                      AI is analyzing your case
                    </CardTitle>
                    <CardDescription className="mt-1">
                      This usually takes 30-90 seconds. We&apos;re reading your
                      policy and rejection letter, then writing the verdict.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-500">
                  This page auto-refreshes. You can close it and come back any
                  time — your verdict will be saved here once it&apos;s ready.
                </p>
              </CardContent>
            </Card>
          )}

        {verdict && <VerdictCard verdict={verdict} />}

        {caseRow.aiStatus === "failed" && aiError && (
          <Card className="border-red-200 bg-red-50/40">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-700">
                  <XCircle className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-red-900">
                    AI couldn&apos;t generate verdict
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Don&apos;t worry — we&apos;ve been notified and will review
                    your case manually. Email us if you don&apos;t hear back
                    within 24 hours.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            {session.user.isAdmin && (
              <CardContent>
                <div className="rounded-md bg-red-100/50 border border-red-200 p-3 text-xs font-mono text-red-900 mb-3 break-all">
                  {aiError}
                </div>
                <ReTriggerAiButton caseId={caseRow.id} />
              </CardContent>
            )}
          </Card>
        )}

        {session.user.isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-slate-600">
                Admin actions
              </CardTitle>
              <CardDescription className="text-xs">
                Visible to admins only.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {caseRow.paymentStatus === "unpaid" ? (
                <MarkPaidButton caseId={caseRow.id} />
              ) : (
                <div className="text-xs text-slate-600">
                  Payment status: <span className="font-medium">paid</span>
                </div>
              )}
              {caseRow.paymentStatus === "paid" && (
                <ReTriggerAiButton caseId={caseRow.id} />
              )}
              {verdictWrapper?.meta && (
                <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 mt-3">
                  Model: {verdictWrapper.meta.modelDeployment} · Prompt:{" "}
                  {verdictWrapper.meta.promptVersion} · Took:{" "}
                  {verdictWrapper.meta.elapsedMs}ms ·{" "}
                  {verdictWrapper.meta.generatedAt}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

function AiStatusPill({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return <span className="text-slate-600">Pending</span>;
    case "processing":
      return (
        <span className="inline-flex items-center gap-1 text-blue-700">
          <Loader2 className="h-4 w-4 animate-spin" /> Processing
        </span>
      );
    case "done":
      return (
        <span className="inline-flex items-center gap-1 text-green-700">
          <CheckCircle2 className="h-4 w-4" /> Verdict ready
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex items-center gap-1 text-red-700">
          <XCircle className="h-4 w-4" /> Failed
        </span>
      );
    default:
      return <span className="text-slate-600">{status}</span>;
  }
}

function DocumentsCard({
  docs,
}: {
  docs: { label: string; path: string | null; required: boolean }[];
}) {
  const hasAny = docs.some((d) => d.path);
  if (!hasAny) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Uploaded documents</CardTitle>
        <CardDescription className="text-xs">
          Download links expire after 60 minutes. Refresh the page to renew.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {docs.map((d) => {
          if (!d.path) {
            return (
              <div
                key={d.label}
                className="flex items-center justify-between gap-3 rounded-md border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-500"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span>{d.label}</span>
                </div>
                <span>{d.required ? "Not uploaded" : "Not uploaded (optional)"}</span>
              </div>
            );
          }
          const url = getReadSasUrl(d.path, 60);
          const filename = d.path.split("/").pop() ?? d.label;
          return (
            <a
              key={d.label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2 hover:border-blue-300 hover:bg-blue-50/40 transition-colors group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900">
                    {d.label}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {filename}
                  </div>
                </div>
              </div>
              <Download className="h-4 w-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
            </a>
          );
        })}
      </CardContent>
    </Card>
  );
}
