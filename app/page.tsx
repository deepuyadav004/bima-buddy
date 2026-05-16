import Link from "next/link";
import {
  Shield,
  Check,
  X,
  ArrowRight,
  Lock,
  Flag,
  Upload,
  CreditCard,
  Sparkles,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { auth } from "@/lib/auth";

const HOW_IT_WORKS = [
  {
    icon: Phone,
    step: "1",
    title: "Sign up with WhatsApp",
    body: "One tap. We use OTPless — no passwords, no SMS hassle.",
  },
  {
    icon: CreditCard,
    step: "2",
    title: "Pay ₹199",
    body: "Secure UPI / card. Non-refundable — covers your AI verdict.",
  },
  {
    icon: Upload,
    step: "3",
    title: "Upload your docs",
    body: "Rejection letter, policy PDF, hospital bills. We do the rest.",
  },
  {
    icon: Sparkles,
    step: "4",
    title: "Get verdict in 60 sec",
    body: "Plain English. Honest answer. Win probability. Next steps.",
  },
];

const INCLUDED = [
  "AI-powered analysis of your specific rejection",
  "Plain-English explanation of why you were denied",
  "Honest verdict — can we fight, or is it legitimate?",
  "Win probability based on similar past cases",
  "Cited IRDAI clauses + case-law references",
  "Recommended next step",
  "Free WhatsApp follow-up support for 7 days",
];

const NOT_INCLUDED = [
  "Magic guarantees of recovery",
  "Refunds on ₹199 (it covers the AI cost)",
  "Dispute filing — that's a separate service, paid only if we recover money",
];

const FAQ = [
  {
    q: "Why ₹199 — what am I paying for?",
    a: "₹199 covers AI compute + our advisory review of your rejection. You get a written verdict telling you whether the rejection is fightable, the likely win probability, the exact IRDAI clauses to cite, and the recommended next step. Non-refundable because the AI work is done the moment you upload.",
  },
  {
    q: "What if the AI says my rejection is legitimate?",
    a: "You still get the full explanation of why, plus advice on what policy to choose next time. We won't take your dispute case if odds are below ~20% — we tell you straight. That honesty is the whole product.",
  },
  {
    q: "How do you actually fight a rejection?",
    a: "Step 1: structured GRO letter citing the exact policy clause + IRDAI Master Circular 2024. Step 2: file on IRDAI Bima Bharosa Portal. Step 3: if needed, file with the Insurance Ombudsman. Step 4: Consumer Forum for amounts > ₹50k. We handle all paperwork.",
  },
  {
    q: "What's your win rate?",
    a: "Based on the 6 rejection categories we triage, the weighted win rate across cases we take is ~55-60%. We refuse cases where we don't have a real shot. The IRDAI Ombudsman itself has a ~65% complainant win rate.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. Encrypted in transit and at rest on Azure. We never share your documents with the insurer or any third party. We don't sell data. You can request deletion any time.",
  },
  {
    q: "What if I already complained to the insurer?",
    a: "Even better. We can escalate to Bima Bharosa or the Insurance Ombudsman directly. Bring your previous correspondence — it strengthens the case.",
  },
  {
    q: "How do you make money?",
    a: "₹199 per verdict + 10% success fee (capped ₹5,000) on recoveries. That's it. We take zero commission from insurers and never recommend specific policies for sale.",
  },
  {
    q: "Who built this?",
    a: "An independent founder operating in India as a sole proprietor. Bima Buddy is not affiliated with any insurance company, broker, or aggregator. Contact us anytime via WhatsApp or email — listed in the footer.",
  },
];

export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const ctaHref = isLoggedIn ? "/triage" : "/login";

  return (
    <main className="min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-lg"
          >
            <Shield className="h-6 w-6 text-blue-600" />
            <span>Bima Buddy</span>
          </Link>
          <div className="flex items-center gap-3">
            {isLoggedIn && (
              <Link
                href="/triage"
                className="hidden sm:inline text-sm text-slate-600 hover:text-blue-600"
              >
                My cases
              </Link>
            )}
            <Button asChild size="sm">
              <Link href={ctaHref}>
                Get AI verdict — ₹199 <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-b from-blue-50/50 to-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            AI-powered claim help for India
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900">
            Your health insurance claim was rejected?
            <br />
            <span className="text-blue-600">Don&apos;t just accept it.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Get an honest AI verdict in 60 seconds for{" "}
            <span className="font-semibold text-slate-900">₹199</span>. If we
            can fight, we fight — and you only pay if we recover your money.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link href={ctaHref}>
                Get AI verdict — ₹199 <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#how-it-works">How it works ↓</Link>
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap gap-3 justify-center text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <Flag className="h-4 w-4 text-orange-600" /> Made for India
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-green-600" /> 100% Independent
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-blue-600" /> No insurer affiliation
            </span>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-slate-900">30%</div>
            <div className="text-sm text-slate-600 mt-1">
              of Indian health claims have issues
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">₹50k–5L</div>
            <div className="text-sm text-slate-600 mt-1">
              average amount lost per family
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">~65%</div>
            <div className="text-sm text-slate-600 mt-1">
              IRDAI Ombudsman complainant win rate
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              How it works
            </h2>
            <p className="mt-3 text-slate-600">Four steps. Sixty seconds.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW_IT_WORKS.map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.step} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-3xl font-bold text-slate-200">
                        {step.step}
                      </span>
                    </div>
                    <CardTitle className="mt-3">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600">{step.body}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHAT ₹199 GETS YOU */}
      <section className="bg-slate-50 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              What ₹199 gets you
            </h2>
            <p className="mt-3 text-slate-600">
              Honest about what&apos;s included — and what&apos;s not.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Check className="h-5 w-5" /> Included
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {INCLUDED.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                      <span className="text-sm text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-700">
                  <X className="h-5 w-5" /> Not included
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {NOT_INCLUDED.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <X className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Frequently asked questions
            </h2>
            <p className="mt-3 text-slate-600">
              The hard questions, answered honestly.
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {FAQ.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-blue-600 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to find out if your claim can be fought?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Verdict in 60 seconds. Then it&apos;s your call.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" variant="secondary">
              <Link href={ctaHref}>
                Get AI verdict — ₹199 <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            <div>
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <Shield className="h-5 w-5 text-blue-600" />
                Bima Buddy
              </div>
              <p className="mt-3 text-slate-600">
                Independent AI claim help for India.
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Not affiliated with any insurance company. We do not sell
                insurance.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Get help</h3>
              <ul className="mt-3 space-y-2 text-slate-600">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a
                    href="mailto:help@bimabuddy.in"
                    className="hover:text-blue-600"
                  >
                    help@bimabuddy.in
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <a
                    href="https://wa.me/91XXXXXXXXXX"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600"
                  >
                    WhatsApp us
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Legal</h3>
              <ul className="mt-3 space-y-2 text-slate-600">
                <li>
                  <Link href="/about" className="hover:text-blue-600">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-blue-600">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-blue-600">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row justify-between gap-2">
            <p>
              &copy; {new Date().getFullYear()} Bima Buddy. All rights reserved.
            </p>
            <p>Built for India. Made with focus.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
