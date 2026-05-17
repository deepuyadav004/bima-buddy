import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  ArrowLeft,
  Users,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cases, users } from "@/lib/db/schema";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth-buttons";
import {
  MarkPaidButton,
  ReTriggerAiButton,
} from "@/app/triage/[caseId]/admin-actions";
import { DisputeForm } from "./dispute-form";
import { formatExpiryLabel, isExpired } from "@/lib/case-status";

export const dynamic = "force-dynamic";

const UPFRONT_FEE = 199;
const SUCCESS_FEE_CAP = 5000;

type FilterKey =
  | "all"
  | "unpaid"
  | "paid"
  | "processing"
  | "done"
  | "expired"
  | "won";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unpaid", label: "Unpaid" },
  { key: "paid", label: "Paid" },
  { key: "processing", label: "Processing" },
  { key: "done", label: "Verdict ready" },
  { key: "won", label: "Won disputes" },
  { key: "expired", label: "Expired" },
];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }
  if (!session.user.isAdmin) {
    redirect("/triage");
  }

  const params = await searchParams;
  const filter: FilterKey =
    (FILTERS.find((f) => f.key === params.status)?.key as FilterKey) ?? "all";

  const baseRows = await db
    .select({
      id: cases.id,
      insurer: cases.insurer,
      claimAmount: cases.claimAmount,
      claimType: cases.claimType,
      rejectionDate: cases.rejectionDate,
      paymentStatus: cases.paymentStatus,
      aiStatus: cases.aiStatus,
      disputeStatus: cases.disputeStatus,
      amountRecovered: cases.amountRecovered,
      expiresAt: cases.expiresAt,
      createdAt: cases.createdAt,
      userId: cases.userId,
      userName: users.name,
      userEmail: users.email,
      userPhone: users.phone,
    })
    .from(cases)
    .leftJoin(users, eq(cases.userId, users.id))
    .orderBy(desc(cases.createdAt));

  // ============================================================
  // Compute stats (across ALL rows)
  // ============================================================
  let total = 0;
  let unpaidCount = 0;
  let paidCount = 0;
  let processingCount = 0;
  let doneCount = 0;
  let expiredCount = 0;
  let wonCount = 0;
  let recoveredTotal = 0;
  let successFeeTotal = 0;

  for (const r of baseRows) {
    total += 1;
    const expired = isExpired(r.expiresAt) && r.paymentStatus === "unpaid";
    if (expired) expiredCount += 1;

    if (r.paymentStatus === "unpaid" && !expired) unpaidCount += 1;
    if (r.paymentStatus === "paid") paidCount += 1;
    if (r.aiStatus === "processing") processingCount += 1;
    if (r.aiStatus === "done") doneCount += 1;

    if (r.disputeStatus === "won") {
      wonCount += 1;
      const rec = Number(r.amountRecovered ?? 0);
      recoveredTotal += rec;
      const fee = Math.min(SUCCESS_FEE_CAP, Math.floor(rec * 0.1));
      successFeeTotal += Math.max(0, fee);
    }
  }

  const grossUpfrontRevenue = paidCount * UPFRONT_FEE;
  const balanceOwed = Math.max(0, successFeeTotal - wonCount * UPFRONT_FEE);

  // ============================================================
  // Apply filter
  // ============================================================
  const rows = baseRows.filter((r) => {
    const expired = isExpired(r.expiresAt) && r.paymentStatus === "unpaid";
    switch (filter) {
      case "unpaid":
        return r.paymentStatus === "unpaid" && !expired;
      case "paid":
        return r.paymentStatus === "paid";
      case "processing":
        return r.aiStatus === "processing";
      case "done":
        return r.aiStatus === "done";
      case "expired":
        return expired;
      case "won":
        return r.disputeStatus === "won";
      default:
        return true;
    }
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-lg"
          >
            <Shield className="h-6 w-6 text-blue-600" />
            <span>Bima Buddy</span>
            <span className="text-xs uppercase tracking-wide px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 ml-1">
              Admin
            </span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Button asChild variant="ghost" size="sm">
              <Link href="/triage">
                <ArrowLeft className="h-4 w-4" />
                <span className="ml-1">My triage</span>
              </Link>
            </Button>
            <span className="hidden sm:inline text-slate-600">
              {session.user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin dashboard</h1>
          <p className="text-sm text-slate-600 mt-1">
            All cases across all users. Total: {total}.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <StatCard
            label="Total cases"
            value={total.toString()}
            icon={<Users className="h-4 w-4" />}
          />
          <StatCard
            label="Paid"
            value={paidCount.toString()}
            sub={`₹${grossUpfrontRevenue.toLocaleString("en-IN")} upfront`}
            icon={<IndianRupee className="h-4 w-4" />}
            tone="green"
          />
          <StatCard
            label="Verdicts delivered"
            value={doneCount.toString()}
            icon={<CheckCircle2 className="h-4 w-4" />}
            tone="blue"
          />
          <StatCard
            label="Won disputes"
            value={wonCount.toString()}
            sub={
              wonCount > 0
                ? `₹${recoveredTotal.toLocaleString("en-IN")} recovered`
                : undefined
            }
            icon={<CheckCircle2 className="h-4 w-4" />}
            tone="green"
          />
        </div>

        {wonCount > 0 && (
          <Card className="bg-green-50/40 border-green-200">
            <CardContent className="py-4 grid gap-3 sm:grid-cols-3 text-sm">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Recovered for users
                </div>
                <div className="font-semibold text-lg text-slate-900">
                  ₹{recoveredTotal.toLocaleString("en-IN")}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Success fee earned (capped)
                </div>
                <div className="font-semibold text-lg text-slate-900">
                  ₹{successFeeTotal.toLocaleString("en-IN")}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Balance to collect (after ₹199 credit)
                </div>
                <div className="font-semibold text-lg text-slate-900">
                  ₹{balanceOwed.toLocaleString("en-IN")}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={f.key === "all" ? "/admin" : `/admin?status=${f.key}`}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                filter === f.key
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {/* Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {FILTERS.find((f) => f.key === filter)?.label} cases — {rows.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">User</th>
                    <th className="text-left px-4 py-2 font-medium">Insurer / claim</th>
                    <th className="text-left px-4 py-2 font-medium">Status</th>
                    <th className="text-left px-4 py-2 font-medium">Dispute outcome</th>
                    <th className="text-left px-4 py-2 font-medium">Created</th>
                    <th className="text-right px-4 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-slate-500 py-10">
                        No cases match this filter.
                      </td>
                    </tr>
                  )}
                  {rows.map((r) => {
                    const expired =
                      isExpired(r.expiresAt) && r.paymentStatus === "unpaid";
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/50 align-top">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">
                            {r.userName ?? "—"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {r.userEmail}
                          </div>
                          {r.userPhone && (
                            <div className="text-xs text-slate-500">
                              {r.userPhone}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">
                            {r.insurer}
                          </div>
                          <div className="text-xs text-slate-500">
                            ₹{Number(r.claimAmount).toLocaleString("en-IN")} ·{" "}
                            {r.claimType}
                          </div>
                          <div className="text-xs text-slate-500">
                            Rejected {r.rejectionDate}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadges
                            payment={r.paymentStatus}
                            ai={r.aiStatus}
                            expired={expired}
                          />
                          {!expired && r.paymentStatus === "unpaid" && (
                            <div className="text-[11px] text-slate-500 mt-1">
                              {formatExpiryLabel(r.expiresAt)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 min-w-[260px]">
                          <DisputeForm
                            caseId={r.id}
                            initialStatus={r.disputeStatus}
                            initialAmount={
                              r.amountRecovered != null
                                ? String(r.amountRecovered)
                                : null
                            }
                          />
                          {r.disputeStatus === "won" && r.amountRecovered && (
                            <div className="text-[11px] text-green-700 mt-1">
                              Fee due: ₹
                              {Math.max(
                                0,
                                Math.min(
                                  SUCCESS_FEE_CAP,
                                  Math.floor(Number(r.amountRecovered) * 0.1)
                                ) - UPFRONT_FEE
                              ).toLocaleString("en-IN")}{" "}
                              (after ₹199 credit)
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                          {new Date(r.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex flex-wrap gap-2 justify-end">
                            {r.paymentStatus === "unpaid" && !expired && (
                              <MarkPaidButton caseId={r.id} />
                            )}
                            {r.paymentStatus === "paid" && (
                              <ReTriggerAiButton caseId={r.id} />
                            )}
                            <Button asChild variant="ghost" size="sm">
                              <Link href={`/triage/${r.id}`}>
                                View
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  tone?: "green" | "blue";
}) {
  const toneClass =
    tone === "green"
      ? "text-green-700 bg-green-50"
      : tone === "blue"
        ? "text-blue-700 bg-blue-50"
        : "text-slate-700 bg-slate-100";
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">
              {label}
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{value}</div>
            {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
          </div>
          <div
            className={`h-8 w-8 rounded-md flex items-center justify-center ${toneClass}`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadges({
  payment,
  ai,
  expired,
}: {
  payment: string;
  ai: string;
  expired: boolean;
}) {
  if (expired) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
        <Clock className="h-3 w-3" /> Expired
      </span>
    );
  }
  if (payment === "unpaid") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
        <AlertTriangle className="h-3 w-3" /> Awaiting payment
      </span>
    );
  }
  if (ai === "processing") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
        <Clock className="h-3 w-3" /> Processing
      </span>
    );
  }
  if (ai === "done") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded">
        <CheckCircle2 className="h-3 w-3" /> Verdict ready
      </span>
    );
  }
  if (ai === "failed") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded">
        <XCircle className="h-3 w-3" /> AI failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
      <Clock className="h-3 w-3" /> Paid, AI pending
    </span>
  );
}
