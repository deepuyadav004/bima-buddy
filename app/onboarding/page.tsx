import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { OnboardingForm } from "./onboarding-form";
import { Shield } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/onboarding");
  }

  // Already onboarded? Skip straight through.
  if (session.user.phone) {
    redirect("/triage");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="mt-4 text-2xl">One last thing</CardTitle>
          <CardDescription className="mt-2">
            Hi {session.user.name?.split(" ")[0] ?? "there"} — we need your
            WhatsApp number so we can follow up on your case.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingForm />
          <p className="mt-4 text-xs text-slate-500 text-center leading-relaxed">
            We&apos;ll only use this for case updates. No marketing, no sharing.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
