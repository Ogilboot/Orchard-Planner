import { logger } from "./logger";

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function platformFeeBps(): number {
  const raw = Number(process.env.PLATFORM_FEE_BPS);
  return Number.isFinite(raw) && raw >= 0 ? Math.floor(raw) : 500;
}

async function stripeFetch(
  path: string,
  params?: Record<string, string>,
): Promise<Record<string, unknown> | null> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params ? new URLSearchParams(params) : undefined,
  }).catch(() => null);
  if (!res) return null;
  const json = await res.json().catch(() => null);
  if (!json || json.error) {
    logger.warn({ path, error: json?.error?.message }, "stripe request failed");
    return null;
  }
  return json;
}

export type StripeAccountInfo = {
  id: string;
  detailsSubmitted: boolean;
};

export async function createExpressAccount(): Promise<string | null> {
  const account = await stripeFetch("/accounts", {
    type: "express",
  });
  return typeof account?.id === "string" ? account.id : null;
}

export async function createAccountOnboardingLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string,
): Promise<string | null> {
  const link = await stripeFetch("/account_links", {
    account: accountId,
    type: "account_onboarding",
    refresh_url: refreshUrl,
    return_url: returnUrl,
  });
  return typeof link?.url === "string" ? link.url : null;
}

export async function createAccountLoginLink(accountId: string): Promise<string | null> {
  const link = await stripeFetch(`/accounts/${accountId}/login_links`, {});
  return typeof link?.url === "string" ? link.url : null;
}

export async function getStripeAccountInfo(accountId: string): Promise<StripeAccountInfo | null> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  const res = await fetch(`https://api.stripe.com/v1/accounts/${accountId}`, {
    headers: { Authorization: `Bearer ${key}` },
  }).catch(() => null);
  if (!res) return null;
  const json = await res.json().catch(() => null);
  if (!json || json.error || typeof json.id !== "string") return null;
  return { id: json.id, detailsSubmitted: Boolean(json.details_submitted) };
}
