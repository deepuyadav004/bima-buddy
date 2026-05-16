"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { INDIAN_HEALTH_INSURERS } from "@/lib/insurers";
import { cn } from "@/lib/utils";

interface FieldFile {
  name: string;
  sizeMb: string;
}

function bytesToMb(b: number) {
  return (b / (1024 * 1024)).toFixed(2);
}

export function IntakeForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [insurer, setInsurer] = useState("");
  const [claimType, setClaimType] = useState<"cashless" | "reimbursement">(
    "cashless"
  );
  const [rejectionFile, setRejectionFile] = useState<FieldFile | null>(null);
  const [policyFile, setPolicyFile] = useState<FieldFile | null>(null);
  const [billsFile, setBillsFile] = useState<FieldFile | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    formData.set("insurer", insurer);
    formData.set("claimType", claimType);

    if (!insurer) {
      toast.error("Pick your insurer");
      return;
    }
    if (!rejectionFile) {
      toast.error("Upload the rejection letter");
      return;
    }
    if (!policyFile) {
      toast.error("Upload the policy document");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Submission failed");
      }
      const { caseId } = await res.json();
      toast.success("Case created. Awaiting payment confirmation.");
      router.push(`/triage/${caseId}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
      {/* Insurer */}
      <div className="space-y-2">
        <Label htmlFor="insurer" className="text-sm font-medium">
          Insurance company
        </Label>
        <Select value={insurer} onValueChange={setInsurer}>
          <SelectTrigger id="insurer">
            <SelectValue placeholder="Pick your insurer" />
          </SelectTrigger>
          <SelectContent>
            {INDIAN_HEALTH_INSURERS.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Claim amount + date in a row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="claimAmount" className="text-sm font-medium">
            Claim amount (₹)
          </Label>
          <Input
            id="claimAmount"
            name="claimAmount"
            type="number"
            min="1"
            step="1"
            placeholder="50000"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rejectionDate" className="text-sm font-medium">
            Rejection date
          </Label>
          <Input
            id="rejectionDate"
            name="rejectionDate"
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            required
          />
        </div>
      </div>

      {/* Claim type radio */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Claim type</Label>
        <RadioGroup
          value={claimType}
          onValueChange={(v) => setClaimType(v as "cashless" | "reimbursement")}
          className="grid grid-cols-2 gap-3"
        >
          <label
            className={cn(
              "flex items-center gap-2 rounded-md border p-3 cursor-pointer transition-colors",
              claimType === "cashless"
                ? "border-blue-500 bg-blue-50"
                : "border-slate-200 hover:bg-slate-50"
            )}
          >
            <RadioGroupItem value="cashless" />
            <span className="text-sm">Cashless</span>
          </label>
          <label
            className={cn(
              "flex items-center gap-2 rounded-md border p-3 cursor-pointer transition-colors",
              claimType === "reimbursement"
                ? "border-blue-500 bg-blue-50"
                : "border-slate-200 hover:bg-slate-50"
            )}
          >
            <RadioGroupItem value="reimbursement" />
            <span className="text-sm">Reimbursement</span>
          </label>
        </RadioGroup>
      </div>

      {/* File uploads */}
      <div className="space-y-3">
        <FileField
          name="rejectionDoc"
          label="Rejection letter"
          accept="application/pdf,image/jpeg,image/jpg,image/png"
          required
          onChange={(file) =>
            setRejectionFile(
              file
                ? { name: file.name, sizeMb: bytesToMb(file.size) }
                : null
            )
          }
          file={rejectionFile}
          hint="PDF, JPG, or PNG · max 10 MB"
        />
        <FileField
          name="policyDoc"
          label="Policy document"
          accept="application/pdf,image/jpeg,image/jpg,image/png"
          required
          onChange={(file) =>
            setPolicyFile(
              file
                ? { name: file.name, sizeMb: bytesToMb(file.size) }
                : null
            )
          }
          file={policyFile}
          hint="PDF preferred · max 25 MB"
        />
        <FileField
          name="billsDoc"
          label="Hospital bills / discharge summary (optional)"
          accept="application/pdf,image/jpeg,image/jpg,image/png"
          onChange={(file) =>
            setBillsFile(
              file
                ? { name: file.name, sizeMb: bytesToMb(file.size) }
                : null
            )
          }
          file={billsFile}
          hint="Strongly recommended · max 25 MB"
        />
      </div>

      <div className="pt-2 border-t border-slate-100">
        <div className="text-xs text-slate-500 mb-3">
          On submit, we&apos;ll create your case and ask you to pay ₹199.
          We&apos;ll start the AI verdict once payment is confirmed.
        </div>
        <Button type="submit" disabled={submitting} className="w-full" size="lg">
          {submitting ? "Uploading..." : "Submit & continue to payment"}
          {!submitting && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </form>
  );
}

function FileField({
  name,
  label,
  accept,
  required,
  hint,
  file,
  onChange,
}: {
  name: string;
  label: string;
  accept: string;
  required?: boolean;
  hint?: string;
  file: FieldFile | null;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {!file ? (
        <label
          htmlFor={name}
          className="flex items-center gap-3 rounded-md border-2 border-dashed border-slate-300 p-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
        >
          <Upload className="h-5 w-5 text-slate-400" />
          <div className="flex-1 min-w-0">
            <div className="text-sm text-slate-700">
              Click to upload or drag a file here
            </div>
            {hint && (
              <div className="text-xs text-slate-500 mt-0.5">{hint}</div>
            )}
          </div>
        </label>
      ) : (
        <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
          <FileText className="h-5 w-5 text-blue-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{file.name}</div>
            <div className="text-xs text-slate-500">{file.sizeMb} MB</div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (inputRef.current) inputRef.current.value = "";
              onChange(null);
            }}
            className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <input
        ref={inputRef}
        id={name}
        name={name}
        type="file"
        accept={accept}
        required={required}
        className="sr-only"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
