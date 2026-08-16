import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { toCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const transactions = await db.transaction.findMany({
    where: { sellerId: session.user.id, status: "COMPLETED" },
    include: { listing: { include: { variety: true } }, buyer: true },
    orderBy: { updatedAt: "desc" },
  });

  const rows = [
    ["Variety", "Buyer", "Amount (£)", "Postage (£)", "Total (£)", "Completed"],
    ...transactions.map((t) => {
      const amount = t.amountPence != null ? t.amountPence / 100 : 0;
      const postage = t.postagePence != null ? t.postagePence / 100 : 0;
      return [
        t.listing.variety.commonName,
        t.buyer.name ?? t.buyer.email,
        t.amountPence != null ? amount.toFixed(2) : "",
        t.postagePence != null ? postage.toFixed(2) : "",
        (amount + postage).toFixed(2),
        t.updatedAt.toISOString().slice(0, 10),
      ];
    }),
  ];

  const csv = toCsv(rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="sales.csv"',
    },
  });
}
