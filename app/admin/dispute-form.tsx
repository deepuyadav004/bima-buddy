"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DisputeStatus =
  | "not_started"
  | "filed"
  | "won"
  | "lost"
  | "withdrawn";

const DISPUTE_OPTIONS: { value: DisputeStatus; label: string }[] = [
  { value: "not_started", label: "Not started" },
  { value: "filed", label: "Filed" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
  { value: "withdrawn", label: "Withdrawn" },
];

interface Props {
  caseId: string;
  initialStatus: string | null;
  initialAmount: string | null;
}

export function DisputeForm({
  caseId,
  initialStatus,
  initialAmount,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<DisputeStatus>(
    (initialStatus as DisputeStatus | null) ?? "not_started"
  );
  const [amount, setAmount] = useState(initialAmount ?? "");
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disputeStatus: status,
          amountRecovered: amount === "" ? null : Number(amount),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Failed");
      }
      toast.success("Dispute updated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as DisputeStatus)}
        disabled={loading}
        className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs"
      >
        {DISPUTE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <Input
        type="number"
        inputMode="numeric"
        placeholder="₹ recovered"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={loading}
        className="h-8 w-32 text-xs"
      />
      <Button onClick={save} variant="outline" size="sm" disabled={loading}>
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        Save
      </Button>
    </div>
  );
}
