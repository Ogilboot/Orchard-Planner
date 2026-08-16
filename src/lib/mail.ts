type MailOptions = {
  to: string;
  subject: string;
  text: string;
};

// Best-effort email via Resend-compatible API. No-op unless configured.
export async function sendEmail(opts: MailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return;

  try {
    await fetch("https://api.resend.com/emails", {
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
  } catch {
    // ignore email failures — never block the primary action
  }
}
