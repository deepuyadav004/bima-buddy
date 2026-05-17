import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Privacy Policy — Bima Buddy",
  description:
    "How Bima Buddy collects, uses, and protects your data. We don't sell anything to anyone.",
};

const supportEmail =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "help@bimabuddy.in";

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-500 mt-2">Last updated: {updated}</p>

        <div className="mt-8 text-sm leading-relaxed text-slate-700 space-y-6">
          <p className="bg-blue-50 border border-blue-200 rounded-md p-3 text-slate-900">
            <strong>The short version:</strong> We collect only what we need to
            help you fight your claim. We don&apos;t sell your data. We
            don&apos;t share it with insurers. You can delete it any time.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              1. Who we are
            </h2>
            <p className="mt-2">
              Bima Buddy is operated by an independent sole proprietor based in
              India. Contact:{" "}
              <a
                href={`mailto:${supportEmail}`}
                className="text-blue-600 underline"
              >
                {supportEmail}
              </a>
              . We are not affiliated with any insurance company.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              2. What data we collect
            </h2>
            <ul className="mt-2 list-disc list-inside space-y-1.5 marker:text-slate-400">
              <li>
                <strong>Account info:</strong> Your name, email, and Google
                profile photo (via Google Sign-In)
              </li>
              <li>
                <strong>Phone number:</strong> Collected during onboarding so we
                can reach you about your case
              </li>
              <li>
                <strong>Case documents:</strong> Rejection letters, policy
                PDFs, hospital bills you upload
              </li>
              <li>
                <strong>Case metadata:</strong> Insurer name, claim amount,
                rejection date, claim type
              </li>
              <li>
                <strong>Communication:</strong> Emails you send us, support
                conversations
              </li>
              <li>
                <strong>Basic technical info:</strong> IP address and browser
                info (for security)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              3. How we use it
            </h2>
            <ul className="mt-2 list-disc list-inside space-y-1.5 marker:text-slate-400">
              <li>To generate your AI verdict (we send your docs to Azure OpenAI for analysis)</li>
              <li>To draft dispute letters when you opt into the dispute service</li>
              <li>To contact you about case progress, payments, and updates</li>
              <li>To improve our AI prompts and case patterns (in aggregate, never identifiable)</li>
              <li>To comply with legal obligations (e.g., dispute records for IRDAI Ombudsman)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              4. Who we share with
            </h2>
            <p className="mt-2">
              We share your data ONLY with these processors, strictly to deliver
              the service:
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1.5 marker:text-slate-400">
              <li>
                <strong>Azure (Microsoft):</strong> Hosting, database, file
                storage, AI inference. India + Singapore data centers.
              </li>
              <li>
                <strong>Google:</strong> Sign-in authentication (email + name
                only).
              </li>
              <li>
                <strong>Resend:</strong> Transactional email delivery.
              </li>
              <li>
                <strong>IRDAI / Insurance Ombudsman:</strong> Only if you opt
                into our dispute service and we file on your behalf. The
                documents you authorize us to submit.
              </li>
            </ul>
            <p className="mt-3">
              <strong>We do NOT share with:</strong> your insurance company
              (except via your authorized dispute filings), advertisers, data
              brokers, or any third party for marketing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              5. How long we keep it
            </h2>
            <ul className="mt-2 list-disc list-inside space-y-1.5 marker:text-slate-400">
              <li>
                <strong>Active cases:</strong> Until resolution + 1 year
                (required for Ombudsman dispute records)
              </li>
              <li>
                <strong>Unpaid cases:</strong> Auto-expire and become eligible
                for deletion after 30 days
              </li>
              <li>
                <strong>Account info:</strong> While your account is active.
                Deleted within 30 days of account closure on request.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              6. Your rights (DPDP Act 2023)
            </h2>
            <p className="mt-2">
              Under India&apos;s Digital Personal Data Protection Act 2023, you
              have the right to:
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1.5 marker:text-slate-400">
              <li>Access the data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>Delete your data (subject to legal retention)</li>
              <li>Withdraw consent for processing</li>
              <li>Lodge a complaint with the Data Protection Board of India</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email{" "}
              <a
                href={`mailto:${supportEmail}`}
                className="text-blue-600 underline"
              >
                {supportEmail}
              </a>{" "}
              with the subject &quot;Privacy request&quot;.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">7. Security</h2>
            <p className="mt-2">
              Your data is encrypted in transit (TLS) and at rest (Azure
              standard encryption). Access is restricted to the founder /
              operator. We&apos;ll notify you within 72 hours of any data
              breach affecting your information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">8. Children</h2>
            <p className="mt-2">
              Bima Buddy is for adults (18+). We don&apos;t knowingly collect
              data from minors.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              9. Changes to this policy
            </h2>
            <p className="mt-2">
              We&apos;ll update this page if the policy changes. Material
              changes will be communicated via email to active users.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">10. Questions</h2>
            <p className="mt-2">
              Anything unclear? Email{" "}
              <a
                href={`mailto:${supportEmail}`}
                className="text-blue-600 underline"
              >
                {supportEmail}
              </a>
              . We respond within 24 hours on working days.
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
