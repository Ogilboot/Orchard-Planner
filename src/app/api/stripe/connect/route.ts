import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  createAccountOnboardingLink,
  createExpressAccount,
  stripeConfigured,
} from "@/lib/stripe";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  if (!stripeConfigured()) {
    return NextResponse.json(
      { error: "Payments are not configured. Set STRIPE_SECRET_KEY to enable seller payouts." },
      { status: 501 },
    );
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  let accountId = user.stripeAccountId;
  if (!accountId) {
    accountId = await createExpressAccount();
    if (!accountId) {
      return NextResponse.json(
        { error: "Could not create a Stripe account. Try again later." },
        { status: 502 },
      );
    }
    await db.user.update({ where: { id: user.id }, data: { stripeAccountId: accountId } });
  }

  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const url = await createAccountOnboardingLink(
    accountId,
    `${base}/dashboard?connect=refresh`,
    `${base}/dashboard?connect=ok`,
  );

  if (!url) {
    return NextResponse.json(
      { error: "Could not start Stripe onboarding. Try again later." },
      { status: 502 },
    );
  }

  return NextResponse.redirect(url, 303);
}