import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { createAccountLoginLink, stripeConfigured } from "@/lib/stripe";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  if (!stripeConfigured()) {
    return NextResponse.json(
      { error: "Payments are not configured." },
      { status: 501 },
    );
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user?.stripeAccountId) {
    return NextResponse.json(
      { error: "No connected Stripe account found." },
      { status: 400 },
    );
  }

  const url = await createAccountLoginLink(user.stripeAccountId);
  if (!url) {
    return NextResponse.json(
      { error: "Could not open your Stripe account. Try again later." },
      { status: 502 },
    );
  }

  return NextResponse.redirect(url, 303);
}