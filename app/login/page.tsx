import Link from "next/link";
import { redirect } from "next/navigation";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GoogleSignInButton } from "@/components/auth-buttons";
import { auth } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/triage";

  if (session?.user) {
    redirect(callbackUrl);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="mt-4 text-2xl">Sign in to Bima Buddy</CardTitle>
          <CardDescription className="mt-2">
            One tap. No passwords. Your data stays private.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <GoogleSignInButton callbackUrl={callbackUrl} />

          <div className="text-xs text-center text-slate-500 leading-relaxed pt-2">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-slate-700">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-slate-700">
              Privacy Policy
            </Link>
            .
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Button asChild variant="ghost" className="w-full text-slate-600">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                <span className="ml-1">Back to home</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
