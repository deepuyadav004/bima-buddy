"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function MarkPaidButton({ caseId }: { caseId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/pay`, { method: "POST" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Failed");
      }
      toast.success("Marked paid. AI triage starting in background.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={onClick} variant="outline" size="sm" disabled={loading}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      Mark as paid (kicks AI)
    </Button>
  );
}

export function ReTriggerAiButton({ caseId }: { caseId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/process`, {
        method: "POST",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Failed");
      }
      toast.success("AI verdict regenerated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={onClick} variant="outline" size="sm" disabled={loading}>
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Running...
        </>
      ) : (
        "Re-run AI verdict"
      )}
    </Button>
  );
}
