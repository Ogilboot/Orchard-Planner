import { logger } from "./logger";

type MailOptions = {
  to: string;
  subject: string;
  text: string;
};

export function buildAbsoluteUrl(path: string): string {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function emailIsConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  await sendEmail({
    to,
    subject: "Reset your Orchard Planner password",
    text: `You asked to reset your Orchard Planner password.

Click the link below to choose a new password. This link expires in 1 hour:

${resetUrl}

If you didn't request this, you can safely ignore this email.`,
  });
}

export async function sendVerificationEmail(to: string, verifyUrl: string): Promise<void> {
  await sendEmail({
    to,
    subject: "Verify your Orchard Planner email",
    text: `Welcome to Orchard Planner.

Please confirm your email address by clicking the link below. This link expires in 24 hours:

${verifyUrl}

If you didn't create an account, you can safely ignore this email.`,
  });
}

// Best-effort email via Resend-compatible API. No-op unless configured.
export async function sendEmail(opts: MailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    logger.debug({ to: opts.to, subject: opts.subject }, "email skipped (not configured)");
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [opts.to],
        subject: opts.subject,
        text: opts.text,
      }),
    });
    if (!res.ok) {
      logger.warn({ to: opts.to, status: res.status }, "email send failed");
    } else {
      logger.info({ to: opts.to, subject: opts.subject }, "email sent");
    }
  } catch (err) {
    logger.error({ err, to: opts.to }, "email send threw");
  }
}
