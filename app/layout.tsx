import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthSessionProvider } from "@/components/session-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://bimabuddy.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Bima Buddy — AI-Powered Health Insurance Claim Help (India)",
    template: "%s · Bima Buddy",
  },
  description:
    "Got a rejected health insurance claim in India? Get an honest AI verdict in 60 seconds for ₹199. If we can fight, we fight — you only pay if we recover your money. Independent, no insurer affiliation.",
  applicationName: "Bima Buddy",
  keywords: [
    "health insurance claim rejected",
    "insurance claim help india",
    "IRDAI ombudsman",
    "Star Health claim rejected",
    "HDFC ERGO claim rejected",
    "ICICI Lombard claim",
    "Niva Bupa claim",
    "cashless rejection",
    "mediclaim dispute",
    "fight insurance claim rejection india",
    "AI insurance verdict",
  ],
  authors: [{ name: "Bima Buddy" }],
  creator: "Bima Buddy",
  publisher: "Bima Buddy",
  category: "finance",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Bima Buddy",
    title: "Bima Buddy — AI Help for Rejected Health Insurance Claims",
    description:
      "Honest AI verdict on your rejected health insurance claim in 60 seconds. ₹199 upfront — success fee capped at ₹5,000, only on recovery.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bima Buddy — AI Help for Rejected Health Insurance Claims",
    description:
      "Honest AI verdict on your rejected health insurance claim in 60 seconds. ₹199 upfront — pay success fee only on recovery.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-white text-slate-900 flex flex-col">
        <AuthSessionProvider>{children}</AuthSessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
