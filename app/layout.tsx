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

export const metadata: Metadata = {
  title: "Bima Buddy — AI-Powered Health Insurance Claim Help (India)",
  description:
    "Got a rejected health insurance claim in India? Get an honest AI verdict in 60 seconds for ₹199. If we can fight, we fight — you only pay if we recover your money. Independent, no insurer affiliation.",
  keywords: [
    "health insurance claim rejected",
    "insurance claim help india",
    "IRDAI ombudsman",
    "Star Health claim",
    "HDFC ERGO claim",
    "cashless rejection",
  ],
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
