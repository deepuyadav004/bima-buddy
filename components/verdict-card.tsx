import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Scale,
  FileWarning,
  ShieldAlert,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Verdict } from "@/lib/triage";

const CATEGORY_META: Record<
  Verdict["category"],
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    iconBg: string;
    Icon: typeof CheckCircle2;
    headline: string;
  }
> = {
  wrongful_denial: {
    label: "Wrongful denial",
    color: "text-green-800",
    bg: "bg-green-50",
    border: "border-green-200",
    iconBg: "bg-green-100 text-green-700",
    Icon: CheckCircle2,
    headline: "We can fight this.",
  },
  procedural_violation: {
    label: "Procedural violation",
    color: "text-green-800",
    bg: "bg-green-50",
    border: "border-green-200",
    iconBg: "bg-green-100 text-green-700",
    Icon: Scale,
    headline: "Insurer broke IRDAI rules. Strong case.",
  },
  unfair_clause: {
    label: "Unfair clause enforcement",
    color: "text-amber-800",
    bg: "bg-amber-50",
    border: "border-amber-200",
    iconBg: "bg-amber-100 text-amber-700",
    Icon: AlertTriangle,
    headline: "Worth fighting at Ombudsman.",
  },
  documentation_gap: {
    label: "Documentation gap",
    color: "text-amber-800",
    bg: "bg-amber-50",
    border: "border-amber-200",
    iconBg: "bg-amber-100 text-amber-700",
    Icon: FileWarning,
    headline: "Fixable with right paperwork.",
  },
  legitimate_denial: {
    label: "Legitimate denial",
    color: "text-slate-800",
    bg: "bg-slate-50",
    border: "border-slate-200",
    iconBg: "bg-slate-200 text-slate-700",
    Icon: XCircle,
    headline: "This rejection is correct. Here's why.",
  },
  fraud_signal: {
    label: "Fraud signal",
    color: "text-red-800",
    bg: "bg-red-50",
    border: "border-red-200",
    iconBg: "bg-red-100 text-red-700",
    Icon: ShieldAlert,
    headline: "We can't take this case.",
  },
};

const ACTION_LABELS: Record<Verdict["recommended_action"], string> = {
  fight: "Fight via GRO + Bima Bharosa",
  ombudsman: "Escalate to Insurance Ombudsman",
  accept: "Accept the rejection",
  refuse: "We won't take this case",
};

export function VerdictCard({ verdict }: { verdict: Verdict }) {
  const meta = CATEGORY_META[verdict.category];
  const winPct = Math.round(verdict.win_probability * 100);
  const Icon = meta.Icon;

  return (
    <div className="space-y-4">
      {/* Headline card */}
      <Card className={cn(meta.bg, meta.border, "border-2")}>
        <CardHeader>
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full shrink-0",
                meta.iconBg
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div
                className={cn(
                  "text-xs uppercase tracking-wide font-semibold",
                  meta.color
                )}
              >
                {meta.label}
              </div>
              <CardTitle className={cn("mt-1 text-2xl", meta.color)}>
                {meta.headline}
              </CardTitle>
              <CardDescription className="mt-2">
                Win probability:{" "}
                <span className={cn("font-bold", meta.color)}>{winPct}%</span> · Confidence:{" "}
                <span className="capitalize">{verdict.confidence}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Plain explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">What this means</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
            {verdict.plain_explanation}
          </div>
        </CardContent>
      </Card>

      {/* Recommended action */}
      <Card className="border-blue-200 bg-blue-50/40">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-700" />
            Recommended next step
          </CardTitle>
          <CardDescription className="font-medium text-blue-900 mt-1">
            {ACTION_LABELS[verdict.recommended_action]}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700">
            {verdict.recommended_action_detail}
          </p>
        </CardContent>
      </Card>

      {/* Cited clauses */}
      {verdict.cited_clauses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Regulations & precedents we&apos;d cite</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {verdict.cited_clauses.map((c, i) => (
                <li key={i} className="text-sm">
                  <div className="font-semibold text-slate-900">{c.source}</div>
                  <div className="text-slate-700 mt-0.5">{c.citation}</div>
                  <div className="text-slate-500 mt-1 italic text-xs">
                    Why it applies: {c.relevance}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Insurer-specific notes */}
      {verdict.insurer_specific_notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Insurer-specific notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700">
              {verdict.insurer_specific_notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Confidence footer */}
      <div className="text-xs text-slate-500 text-center pt-1">
        AI confidence:{" "}
        <span className="capitalize font-medium">{verdict.confidence}</span> —{" "}
        {verdict.confidence_reason}
      </div>
    </div>
  );
}
