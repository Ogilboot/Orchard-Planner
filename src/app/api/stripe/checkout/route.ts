import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { platformFeeBps, stripeConfigured } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  if (!stripeConfigured()) {
    return NextResponse.json(
      {
        error:
          "Payments are not configured yet. Set STRIPE_SECRET_KEY in .env to enable Stripe checkout.",
      },
      { status: 501 },
    );
  }

  const formData = await req.formData().catch(() => null);
  const transactionId = String(formData?.get("transactionId") ?? "");
  if (!transactionId) {
    return NextResponse.json({ error: "Transaction id is required." }, { status: 400 });
  }

  const tx = await db.transaction.findUnique({
    where: { id: transactionId },
    include: {
      listing: { include: { variety: true } },
      seller: { select: { stripeAccountId: true } },
    },
  });
  if (!tx || tx.buyerId !== session.user.id) {
    return NextResponse.json({ error: "Transaction not found." }, { status: 404 });
  }
  if (tx.amountPence == null) {
    return NextResponse.json({ error: "This transaction has no price." }, { status: 400 });
  }
  if (!tx.seller.stripeAccountId) {
    return NextResponse.json(
      { error: "The seller hasn't set up payments yet." },
      { status: 400 },
    );
  }

  const total = tx.amountPence + (tx.postagePence ?? 0);
  if (total <= 0) {
    return NextResponse.json({ error: "Nothing to pay." }, { status: 400 });
  }

  const feePence = Math.min(Math.round((total * platformFeeBps()) / 10000), total - 1);

  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", `${base}/transactions?paid=1`);
  params.set("cancel_url", `${base}/transactions?canceled=1`);
  params.set("line_items[0][price_data][currency]", "gbp");
  params.set("line_items[0][price_data][unit_amount]", String(total));
  params.set(
    "line_items[0][price_data][product_data][name]",
    `Orchard Planner: ${tx.listing.variety.commonName}`,
  );
  params.set("line_items[0][quantity]", "1");
  params.set("metadata[transactionId]", tx.id);
  params.set("client_reference_id", tx.id);
  params.set("payment_intent_data[transfer_data][destination]", tx.seller.stripeAccountId);
  if (feePence > 0) {
    params.set("payment_intent_data[application_fee_amount]", String(feePence));
  }

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
    body: params,
  }).catch(() => null);

  const json = res ? await res.json().catch(() => null) : null;
  if (!res || !res.ok || !json?.url) {
    return NextResponse.json(
      { error: json?.error?.message || "Stripe checkout failed." },
      { status: 502 },
    );
  }

  return NextResponse.redirect(json.url, 303);
}
