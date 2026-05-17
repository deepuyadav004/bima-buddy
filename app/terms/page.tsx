import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Terms of Service — Bima Buddy",
  description:
    "Terms governing your use of Bima Buddy. Plain English, honest commitments.",
};

const supportEmail =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "help@bimabuddy.in";

export default function TermsPage() {
  const updated = "May 2026";

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

      <article className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
          Terms of Service
        </h1>
        <p className="text-sm text-slate-500 mt-2">Last updated: {updated}</p>

        <div className="mt-8 text-sm leading-relaxed text-slate-700 space-y-6">
          <p className="bg-blue-50 border border-blue-200 rounded-md p-3 text-slate-900">
            <strong>Plain English:</strong> Pay ₹199 to get an AI verdict on
            your claim rejection. If we fight your dispute and recover money,
            we charge a success fee — capped at ₹5,000, minus your ₹199 already
            paid. We&apos;re not a law firm. We don&apos;t guarantee outcomes.
            By using Bima Buddy you agree to these terms.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              1. Who provides the service
            </h2>
            <p className="mt-2">
              Bima Buddy (&quot;we&quot;, &quot;our&quot;, &quot;service&quot;)
              is operated by an independent sole proprietor based in India. We
              are not affiliated with, endorsed by, or partnered with any
              insurance company, broker, aggregator, or regulator.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              2. What we do (and don&apos;t)
            </h2>
            <ul className="mt-2 list-disc list-inside space-y-1.5 marker:text-slate-400">
              <li>
                We are an <strong>advisory + drafting service</strong>. We use
                AI to analyze insurance claim rejections and draft dispute
                letters.
              </li>
              <li>
                We are <strong>NOT a law firm</strong>. We do not provide legal
                advice. We do not appear in court.
              </li>
              <li>
                We are <strong>NOT an insurance broker or agent</strong>. We
                don&apos;t sell insurance products.
              </li>
              <li>
                AI verdicts are{" "}
                <strong>algorithmically generated suggestions</strong> based on
                publicly available IRDAI regulations and case law. They are
                not legal advice.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">3. Pricing</h2>
            <p className="mt-2">
              <strong>₹199 upfront, non-refundable.</strong> Paid per case.
              Covers our AI compute and advisory review.
            </p>
            <p className="mt-2">
              <strong>Success fee</strong> on dispute service: 10% of the
              amount we recover for you, capped at ₹5,000. The ₹199 you
              already paid is credited toward this. If we don&apos;t recover
              money, you pay nothing beyond ₹199.
            </p>
            <p className="mt-2">
              Cases expire 30 days after creation if unpaid. After expiry,
              uploaded documents are eligible for deletion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              4. Your responsibilities
            </h2>
            <ul className="mt-2 list-disc list-inside space-y-1.5 marker:text-slate-400">
              <li>Provide accurate, complete documents</li>
              <li>Don&apos;t upload forged or fraudulent documents</li>
              <li>Maintain confidentiality of your account credentials</li>
              <li>
                Use Bima Buddy only for your own genuine insurance claims
              </li>
              <li>Don&apos;t resell or republish our verdicts</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              5. Our responsibilities
            </h2>
            <ul className="mt-2 list-disc list-inside space-y-1.5 marker:text-slate-400">
              <li>Deliver an AI verdict within 24 hours of payment</li>
              <li>
                Be honest about whether your case is fightable, even if
                it&apos;s a legitimate denial
              </li>
              <li>
                If we accept your dispute case, work it diligently till
                resolution
              </li>
              <li>Never share your data with insurers without your consent</li>
              <li>
                Refuse cases where we don&apos;t have a real shot at winning
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              6. No guarantees
            </h2>
            <p className="mt-2">
              We give honest probability estimates, but insurance disputes
              involve regulators, courts, and human decision-makers we
              don&apos;t control. <strong>We do not guarantee any specific
              outcome.</strong> Even strong cases can lose at the Insurance
              Ombudsman or Consumer Forum.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              7. Limitation of liability
            </h2>
            <p className="mt-2">
              To the maximum extent permitted by law, our total liability for
              any claim related to your use of Bima Buddy is limited to the
              total fees you paid us in the preceding 12 months. We are not
              liable for indirect, consequential, or incidental damages.
            </p>
            <p className="mt-2">
              Our AI verdicts are best-effort interpretations and may contain
              errors. Always verify with primary sources (IRDAI regulations,
              your policy documents) before relying on them.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              8. Termination
            </h2>
            <p className="mt-2">
              You can stop using Bima Buddy any time and request account
              deletion via{" "}
              <a
                href={`mailto:${supportEmail}`}
                className="text-blue-600 underline"
              >
                {supportEmail}
              </a>
              . We can terminate accounts that violate these terms (e.g.,
              fraud, abuse, false documents) without refund.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              9. Governing law
            </h2>
            <p className="mt-2">
              These terms are governed by Indian law. Disputes will be resolved
              in the courts of your local jurisdiction in India.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">10. Changes</h2>
            <p className="mt-2">
              We may update these terms. Material changes will be emailed to
              active users at least 7 days before taking effect.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">11. Contact</h2>
            <p className="mt-2">
              Questions about these terms?{" "}
              <a
                href={`mailto:${supportEmail}`}
                className="text-blue-600 underline"
              >
                {supportEmail}
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="ml-1">Back to home</span>
            </Link>
          </Button>
        </div>
      </article>
    </main>
  );
}
