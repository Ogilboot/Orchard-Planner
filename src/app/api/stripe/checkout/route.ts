import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { listingId } = await req.json().catch(() => ({}));
  if (!listingId) {
    return NextResponse.json({ error: "Listing id is required." }, { status: 400 });
  }

  const listing = await db.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      {
        error:
          "Payments are not configured yet. Set STRIPE_SECRET_KEY in .env to enable Stripe checkout.",
      },
      { status: 501 },
    );
  }

  return NextResponse.json(
    { error: "Stripe checkout is not yet wired up." },
    { status: 501 },
  );
}
