import Link from "next/link";
import { Shield, Mail, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { CopyButton } from "./copy-button";

export const metadata = {
  title: "Contact Us — Bima Buddy",
  description:
    "Email us about your case, payment, or anything else. We respond within 24 hours.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ caseId?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const email =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "help@bimabuddy.in";

  // Pre-fill mailto subject + body with as much context as possible
  const subjectParts: string[] = ["Bima Buddy enquiry"];
  if (params.caseId) {
    subjectParts.push(`case ${params.caseId.substring(0, 8)}`);
  }
  const subject = subjectParts.join(" — ");

  const bodyLines: string[] = [];
  if (session?.user?.name) bodyLines.push(`Hi, I'm ${session.user.name}.`);
  if (params.caseId) bodyLines.push(`My case ID: ${params.caseId}`);
  if (session?.user?.phone)
    bodyLines.push(`My WhatsApp: ${session.user.phone}`);
  bodyLines.push("");
  bodyLines.push("Concern:");
  bodyLines.push("");

  const mailtoHref = `mailto:${email}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(bodyLines.join("\n"))}`;

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
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="ml-1">Home</span>
            </Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-xl px-4 sm:px-6 py-12 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Email us
          </h1>
          <p className="mt-3 text-slate-600">
            Send us an email about your case, payment, or anything else.
            We&apos;ll reply within 24 hours.
          </p>
        </div>

        {params.caseId && (
          <div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-xs">
            <span className="text-blue-700 font-medium">
              Case ID will be included:
            </span>{" "}
            <span className="font-mono break-all">{params.caseId}</span>
          </div>
        )}

        <Card className="border-blue-200">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <Mail className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <CardTitle>Send us an email</CardTitle>
                <CardDescription className="mt-1">
                  Click the button below to open your email app with a
                  pre-filled message.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild size="lg" className="w-full">
              <a href={mailtoHref}>
                <Mail className="h-4 w-4" />
                <span className="ml-1">Email {email}</span>
              </a>
            </Button>

            <div className="text-xs text-slate-500 text-center">
              Or copy the address and email us from anywhere:
            </div>
            <CopyEmailRow email={email} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">What to include</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-700 space-y-2">
            <ul className="space-y-1.5 list-disc list-inside marker:text-slate-400">
              <li>Your case ID (if you have one)</li>
              <li>Your insurer and the claim amount</li>
              <li>What you need: payment link, dispute help, etc.</li>
              <li>Your WhatsApp number (if not in your profile)</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-slate-100/50 border-slate-200">
          <CardContent className="pt-6 flex items-start gap-3">
            <Clock className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
            <div className="text-sm text-slate-700">
              <p className="font-medium">Response time</p>
              <p className="text-slate-600 mt-1">
                Mon–Sat, 10 AM – 8 PM IST. Replies usually within 24 hours.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center pt-2">
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="ml-1">Back to home</span>
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

// --- inline client island for the copy-to-clipboard button ---
function CopyEmailRow({ email }: { email: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <code className="flex-1 text-sm font-mono break-all">{email}</code>
      <CopyButton text={email} />
    </div>
  );
}
