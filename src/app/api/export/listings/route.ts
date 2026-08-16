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

  const listings = await db.listing.findMany({
    where: { userId: session.user.id },
    include: { variety: true },
    orderBy: { createdAt: "desc" },
  });

  const rows = [
    [
      "Variety",
      "Type",
      "Quantity",
      "Price (£)",
      "Postage (£)",
      "Trade only",
      "Status",
      "Location",
      "Created",
    ],
    ...listings.map((l) => [
      l.variety.commonName,
      l.type,
      l.quantity,
      l.pricePence != null ? (l.pricePence / 100).toFixed(2) : "",
      l.postagePence != null ? (l.postagePence / 100).toFixed(2) : "",
      l.tradeOnly ? "yes" : "no",
      l.status,
      l.location ?? "",
      l.createdAt.toISOString().slice(0, 10),
    ]),
  ];

  const csv = toCsv(rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="listings.csv"',
    },
  });
}
