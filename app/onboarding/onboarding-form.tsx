"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { ArrowRight, Phone } from "lucide-react";

export function OnboardingForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate: 10 digits (Indian mobile), or +91 prefix
    const cleaned = phone.replace(/\D/g, "");
    const digits = cleaned.startsWith("91") && cleaned.length === 12
      ? cleaned.slice(2)
      : cleaned;

    if (digits.length !== 10 || !/^[6-9]/.test(digits)) {
      toast.error("Enter a valid 10-digit Indian mobile number");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/profile/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${digits}` }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Failed to save phone");
      }

      toast.success("Phone saved");
      router.push("/triage");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-medium">
          WhatsApp number
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            id="phone"
            type="tel"
            placeholder="9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={submitting}
            autoFocus
            inputMode="numeric"
            className="pl-9"
          />
        </div>
        <p className="text-xs text-slate-500">
          10-digit number, no +91 needed. We&apos;ll WhatsApp you here.
        </p>
      </div>

      <Button type="submit" disabled={submitting} className="w-full" size="lg">
        {submitting ? "Saving..." : "Continue"}
        {!submitting && <ArrowRight className="h-4 w-4" />}
      </Button>
    </form>
  );
}
