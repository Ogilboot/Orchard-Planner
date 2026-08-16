import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function csvCell(value: string | number | null | undefined): string {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const records = await db.plantRecord.findMany({
    where: { userId: session.user.id },
    include: { variety: true, rootstockRef: true },
    orderBy: { createdAt: "desc" },
  });

  const header = [
    "Variety",
    "Rootstock",
    "Rootstock source",
    "Scion source",
    "Graft date",
    "Location",
    "Status",
    "Notes",
    "Created",
  ];
  const rows = records.map((r) => [
    r.variety?.commonName ?? "",
    r.rootstockRef?.name ?? r.rootstock ?? "",
    r.rootstockSource ?? "",
    r.scionSource ?? "",
    r.graftDate ? r.graftDate.toISOString().slice(0, 10) : "",
    r.location ?? "",
    r.status,
    r.notes ?? "",
    r.createdAt.toISOString().slice(0, 10),
  ]);

  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="records.csv"',
    },
  });
}
