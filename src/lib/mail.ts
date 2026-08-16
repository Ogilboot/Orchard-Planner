import { logger } from "./logger";

type MailOptions = {
  to: string;
  subject: string;
  text: string;
};

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
