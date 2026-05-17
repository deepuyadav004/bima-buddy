import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
const supportEmail =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "help@bimabuddy.in";

if (!apiKey) {
  console.warn(
    "[email] RESEND_API_KEY not set — emails will fail until you set it"
  );
}

const resend = apiKey ? new Resend(apiKey) : null;

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: SendEmailInput): Promise<{ id?: string; error?: string }> {
  if (!resend) {
    return { error: "RESEND_API_KEY not configured" };
  }
  try {
    const result = await resend.emails.send({
      from: `Bima Buddy <${fromEmail}>`,
      to,
      subject,
      html,
      replyTo,
    });
    if (result.error) {
      console.error("[email] send failed:", result.error);
      return { error: result.error.message ?? "Resend rejected" };
    }
    return { id: result.data?.id };
  } catch (err) {
    console.error("[email] exception:", err);
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export const SUPPORT_EMAIL = supportEmail;
