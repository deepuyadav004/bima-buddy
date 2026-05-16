import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Sparkles,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { eq, desc } from "drizzle-orm";
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
import { SignOutButton } from "@/components/auth-buttons";
import { IntakeForm } from "./intake-form";

export const dynamic = "force-dynamic";

export default async function TriagePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/triage");
  }
  if (!session.user.phone) {
    redirect("/onboarding");
  }

  const myCases = await db
    .select({
      id: cases.id,
      insurer: cases.insurer,
      claimAmount: cases.claimAmount,
      rejectionDate: cases.rejectionDate,
      paymentStatus: cases.paymentStatus,
      aiStatus: cases.aiStatus,
      createdAt: cases.createdAt,
    })
    .from(cases)
    .where(eq(cases.userId, session.user.id))
    .orderBy(desc(cases.createdAt));

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-lg"
          >
            <Shield className="h-6 w-6 text-blue-600" />
            <span>Bima Buddy</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden sm:inline text-slate-600">
              {session.user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-6">
        {myCases.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              Your cases
            </h2>
            <div className="space-y-2">
              {myCases.map((c) => (
                <Link
                  key={c.id}
                  href={`/triage/${c.id}`}
                  className="block"
                >
                  <Card className="hover:border-blue-300 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            {c.insurer} — ₹
                            {Number(c.claimAmount).toLocaleString("en-IN")}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Rejected on {c.rejectionDate} ·{" "}
                            <StatusPill
                              payment={c.paymentStatus}
                              ai={c.aiStatus}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="text-slate-400 text-sm">→</div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>
                  {myCases.length === 0
                    ? "Start your first triage"
                    : "New triage"}
                </CardTitle>
                <CardDescription className="mt-1">
                  Upload your rejection letter, policy and bills. Pay ₹199 to
                  get the AI verdict.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <IntakeForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function StatusPill({
  payment,
  ai,
}: {
  payment: string;
  ai: string;
}) {
  if (payment === "unpaid") {
    return (
      <span className="inline-flex items-center gap-1 text-amber-700">
        <AlertTriangle className="h-3 w-3" /> Awaiting payment
      </span>
    );
  }
  if (ai === "processing") {
    return (
      <span className="inline-flex items-center gap-1 text-blue-700">
        <Clock className="h-3 w-3" /> Processing
      </span>
    );
  }
  if (ai === "done") {
    return (
      <span className="inline-flex items-center gap-1 text-green-700">
        <CheckCircle2 className="h-3 w-3" /> Verdict ready
      </span>
    );
  }
  return <span className="text-slate-500">Pending</span>;
}
