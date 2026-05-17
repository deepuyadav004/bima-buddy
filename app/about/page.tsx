import Link from "next/link";
import { Shield, ArrowLeft, Mail, Flag, Scale, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "About — Bima Buddy",
  description:
    "We're an independent founder-led service that helps Indians fight wrongly rejected health insurance claims. Not affiliated with any insurer.",
};

const supportEmail =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "help@bimabuddy.in";

export default function AboutPage() {
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

      <article className="mx-auto max-w-2xl px-4 sm:px-6 py-12 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            About Bima Buddy
          </h1>
          <p className="mt-3 text-slate-600">
            Why we built this — and how we make money.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">What we do</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-700 space-y-3 leading-relaxed">
            <p>
              Bima Buddy helps Indian families fight wrongly-rejected health
              insurance claims. We use AI to read your rejection letter, your
              policy, and your bills — and give you an honest verdict on
              whether your case can be won.
            </p>
            <p>
              If the verdict says it&apos;s fightable, we handle the dispute
              ourselves — drafting GRO letters, filing on the IRDAI Bima Bharosa
              Portal, and escalating to the Insurance Ombudsman if needed. You
              focus on your life; we do the paperwork.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base">Why this exists</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-slate-700 space-y-3 leading-relaxed">
            <p>
              About 30% of health insurance claims in India have issues —
              wrongful denials, procedural violations, or unfair clauses being
              applied. Families end up out of pocket for ₹50,000 to ₹5,00,000
              per claim. Most don&apos;t know they can fight back.
            </p>
            <p>
              The IRDAI Insurance Ombudsman exists and works (~65% complainant
              win rate), but the process is bureaucratic and most people give
              up before filing. We&apos;re here to remove that friction —
              honestly, transparently, on a no-recovery-no-fee basis.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base">How we make money</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-slate-700 space-y-3 leading-relaxed">
            <p>
              <strong>₹199 upfront, non-refundable.</strong> Covers our AI
              compute and our advisory review of your case. This filters
              tire-kickers and keeps the service sustainable.
            </p>
            <p>
              <strong>Success fee on recovery — only if we win.</strong> 10% of
              the amount we recover for you, capped at ₹5,000. The ₹199 you
              already paid is credited toward this. So you never pay more than
              ₹5,000 total, no matter the claim size.
            </p>
            <p>
              <strong>That&apos;s it.</strong> We take{" "}
              <em>zero commission</em> from insurance companies. We don&apos;t
              sell insurance. We don&apos;t recommend specific policies in
              exchange for kickbacks. Our only customer is you.
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/40">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-amber-700" />
              <CardTitle className="text-base">What we are NOT</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-slate-700 space-y-2 leading-relaxed">
            <ul className="list-disc list-inside space-y-1.5 marker:text-slate-400">
              <li>Not affiliated with any insurance company, broker, or aggregator</li>
              <li>Not a law firm — we&apos;re an advisory + drafting service</li>
              <li>Not insured by IRDAI — we don&apos;t sell insurance products</li>
              <li>Not a guarantee — even strong cases can lose at Ombudsman</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Who runs this</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-700 space-y-3 leading-relaxed">
            <p>
              Bima Buddy is run by an independent founder operating in India as
              a sole proprietor. No VC funding, no investor pressure to
              compromise on consumer-first principles.
            </p>
            <p>
              If you want to talk to a real human, just{" "}
              <Link href="/contact" className="text-blue-600 underline">
                contact us
              </Link>{" "}
              or email{" "}
              <a
                href={`mailto:${supportEmail}`}
                className="text-blue-600 underline"
              >
                {supportEmail}
              </a>
              .
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-3 pt-2">
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="ml-1">Home</span>
            </Link>
          </Button>
          <Button asChild>
            <Link href="/contact">
              <Mail className="h-4 w-4" />
              <span className="ml-1">Contact us</span>
            </Link>
          </Button>
        </div>
      </article>
    </main>
  );
}
